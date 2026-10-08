import assert from 'assert';
import NoteModel from '../src/api/models/note.model';
import * as redisClient from '../src/redis/client';
import { viewNote } from '../src/api/service/note.service';
import { viewNoteHandler } from '../src/api/controller/note.controller';
import { createFakeResponse } from './helpers';

const model = NoteModel as any;
const redisModule = redisClient as any;

const publicNoteFilter = (_id: string) => ({
  $and: [
    { _id, isDeleted: false },
    { $or: [{ visibility: 'public' }, { visibility: { $exists: false } }] },
  ],
});

async function run() {
  const originals = {
    updateOne: model.updateOne,
    getRedisClient: redisModule.default,
  };

  try {
    // 模型不再持久化访客 IP 数组。
    assert.strictEqual(NoteModel.schema.path('views'), undefined);

    const updates: any[] = [];
    model.updateOne = (filter: unknown, update: unknown) => {
      updates.push({ filter, update });
      return Promise.resolve({ matchedCount: 1 });
    };

    const setCalls: any[] = [];
    let setResult: string | null = 'OK';
    redisModule.default = async () => ({
      set: async (key: string, value: string, options: unknown) => {
        setCalls.push({ key, value, options });
        return setResult;
      },
    });

    // 首次访问：Redis NX 命中后才累加浏览量，不再写入 views。
    await viewNote('note-1', '10.0.0.1');
    assert.deepStrictEqual(setCalls[0], {
      key: 'view:note-1:10.0.0.1',
      value: '1',
      options: { NX: true, EX: 86400 },
    });
    assert.deepStrictEqual(updates, [
      {
        filter: publicNoteFilter('note-1'),
        update: { $inc: { viewCount: 1 } },
      },
    ]);

    // 24 小时内重复访问：不累加。
    setResult = null;
    await viewNote('note-1', '10.0.0.1');
    assert.strictEqual(updates.length, 1);

    // Redis 故障：不抛错、不累加。
    redisModule.default = async () => {
      throw new Error('redis down');
    };
    await viewNote('note-1', '10.0.0.1');
    assert.strictEqual(updates.length, 1);

    // controller 使用 req.ip，不信任客户端自带的 X-Forwarded-For。
    setResult = 'OK';
    setCalls.length = 0;
    redisModule.default = async () => ({
      set: async (key: string, value: string, options: unknown) => {
        setCalls.push({ key, value, options });
        return setResult;
      },
    });
    const res = createFakeResponse();
    await viewNoteHandler(
      {
        ip: '10.0.0.2',
        query: { _id: 'note-2' },
        headers: { 'x-forwarded-for': '1.1.1.1' },
        socket: { remoteAddress: '10.0.0.3' },
      } as any,
      res
    );
    assert.strictEqual(setCalls[0].key, 'view:note-2:10.0.0.2');
    assert.strictEqual(res.body.code, 200);
  } finally {
    model.updateOne = originals.updateOne;
    redisModule.default = originals.getRedisClient;
  }
}

run()
  .then(() => console.log('note view contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
