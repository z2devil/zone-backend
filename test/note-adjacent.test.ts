import assert from 'assert';
import NoteModel from '../src/api/models/note.model';
import { findAdjacentNote } from '../src/api/service/note.service';

const model = NoteModel as any;

async function run() {
  const original = model.findOne;
  try {
    const calls: any[] = [];
    model.findOne = (filter: any, _projection: unknown, options: any) => {
      calls.push({ filter, sort: options.sort });
      return Promise.resolve(null);
    };
    const current = { _id: 'note-5', createdAt: 1000 };

    await findAdjacentNote(current, 'previous');
    await findAdjacentNote(current, 'next');

    // createdAt 相同的笔记按 _id 决定先后，不会被跳过。
    const [previous, next] = calls;
    assert.deepStrictEqual(previous.filter.$and[0].$or, [
      { createdAt: { $lt: 1000 } },
      { createdAt: 1000, _id: { $lt: 'note-5' } },
    ]);
    assert.deepStrictEqual(previous.sort, { createdAt: -1, _id: -1 });
    assert.deepStrictEqual(next.filter.$and[0].$or, [
      { createdAt: { $gt: 1000 } },
      { createdAt: 1000, _id: { $gt: 'note-5' } },
    ]);
    assert.deepStrictEqual(next.sort, { createdAt: 1, _id: 1 });
    // 仍受可读范围约束。
    assert.deepStrictEqual(next.filter.$and[1].$or.length, 2);
  } finally {
    model.findOne = original;
  }
}

run()
  .then(() => console.log('note adjacent contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
