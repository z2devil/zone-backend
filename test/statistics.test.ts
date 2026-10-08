import assert from 'assert';
import NoteModel from '../src/api/models/note.model';
import StatisticsModel from '../src/api/models/statistics.model';
import { collectStatistics } from '../src/schedule';

const noteModel = NoteModel as any;
const statisticsModel = StatisticsModel as any;

async function run() {
  // 统计集合按小时唯一，并通过 TTL 保留 90 天。
  const indexes = StatisticsModel.schema.indexes() as unknown as Array<
    [Record<string, number>, Record<string, unknown>]
  >;
  const periodIndex = indexes.find(([fields]) => fields.period === 1);
  assert.ok(periodIndex, '应有 period 索引');
  assert.strictEqual(periodIndex[1].unique, true);
  const ttlIndex = indexes.find(([fields]) => fields.collectedAt === 1);
  assert.ok(ttlIndex, '应有 collectedAt TTL 索引');
  assert.strictEqual(ttlIndex[1].expireAfterSeconds, 90 * 24 * 60 * 60);

  const originals = {
    find: noteModel.find,
    updateOne: statisticsModel.updateOne,
  };
  try {
    let noteProjection: string[] = [];
    noteModel.find = (_filter: unknown, projection: string[]) => {
      noteProjection = projection;
      return Promise.resolve([
        { content: 'abc', createdAt: Date.UTC(2026, 9, 1, 3), viewCount: 5 },
        { content: 'de', createdAt: Date.UTC(2026, 9, 1, 8), viewCount: 7 },
        { content: 'f', createdAt: Date.UTC(2026, 9, 2, 1) },
      ]);
    };
    const writes: any[] = [];
    statisticsModel.updateOne = (
      filter: unknown,
      update: unknown,
      options: unknown
    ) => {
      writes.push({ filter, update, options });
      return Promise.resolve({ acknowledged: true });
    };

    const now = new Date(Date.UTC(2026, 9, 8, 11, 47, 12));
    await collectStatistics(now);
    await collectStatistics(new Date(Date.UTC(2026, 9, 8, 11, 59, 0)));

    assert.ok(noteProjection.includes('viewCount'));
    const period = Date.UTC(2026, 9, 8, 11);
    // 同一小时两次采集写入同一条记录（upsert），而不是新增文档。
    assert.strictEqual(writes.length, 2);
    for (const write of writes) {
      assert.deepStrictEqual(write.filter, { period });
      assert.deepStrictEqual(write.options, { upsert: true });
    }
    const { $set } = writes[0].update;
    assert.strictEqual($set.viewCount, 12, 'viewCount 为公开笔记浏览量之和');
    assert.strictEqual($set.noteCount, 3);
    assert.strictEqual($set.wordCount, 6);
    assert.deepStrictEqual($set.collectedAt, now);
    assert.strictEqual($set.contributes.length, 2);
  } finally {
    noteModel.find = originals.find;
    statisticsModel.updateOne = originals.updateOne;
  }
}

run()
  .then(() => console.log('statistics contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
