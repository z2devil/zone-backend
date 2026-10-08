import assert from 'assert';
import NoteModel from '../src/api/models/note.model';
import {
  removeNoteHandler,
  updateNoteHandler,
} from '../src/api/controller/note.controller';
import { createFakeResponse } from './helpers';

const model = NoteModel as any;

const asUser = (userId: string) => {
  const res = createFakeResponse();
  res.locals._context = { user: { id: userId } };
  return res;
};

async function run() {
  const originals = {
    updateOne: model.updateOne,
    findOneAndUpdate: model.findOneAndUpdate,
  };

  try {
    // 删除：不存在与无权都未命中写条件，统一返回 404，不泄露存在性。
    model.updateOne = () => Promise.resolve({ matchedCount: 0 });
    let res = asUser('other-user');
    await removeNoteHandler({ body: { _id: 'note-1' } } as any, res);
    assert.strictEqual(res.body.code, 404);
    assert.strictEqual(res.body.message, '资源未找到');

    model.updateOne = () => Promise.resolve({ matchedCount: 1 });
    res = asUser('author');
    await removeNoteHandler({ body: { _id: 'note-1' } } as any, res);
    assert.strictEqual(res.body.code, 200);

    // 更新：同理。
    model.findOneAndUpdate = () => Promise.resolve(null);
    res = asUser('other-user');
    await updateNoteHandler(
      { body: { _id: 'note-1', title: 't', content: 'c' } } as any,
      res
    );
    assert.strictEqual(res.body.code, 404);
    assert.strictEqual(res.body.data, null);

    const note = { _id: 'note-1', title: 't' };
    model.findOneAndUpdate = () => Promise.resolve(note);
    res = asUser('author');
    await updateNoteHandler(
      { body: { _id: 'note-1', title: 't', content: 'c' } } as any,
      res
    );
    assert.strictEqual(res.body.code, 200);
    assert.deepStrictEqual(res.body.data, note);
  } finally {
    model.updateOne = originals.updateOne;
    model.findOneAndUpdate = originals.findOneAndUpdate;
  }
}

run()
  .then(() => console.log('note write contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
