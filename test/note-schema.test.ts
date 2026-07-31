import assert from 'assert';
import {
  createNoteSchema,
  updateNoteSchema,
} from '../src/api/schema/note.schema';

const note = {
  title: '只给自己看的笔记',
  content: '秘密内容',
};

const created = createNoteSchema.parse({ body: note });
assert.strictEqual(
  created.body.visibility,
  'public',
  '旧客户端不传 visibility 时应默认公开'
);

const privateNote = createNoteSchema.parse({
  body: { ...note, visibility: 'private' },
});
assert.strictEqual(privateNote.body.visibility, 'private');

const updated = updateNoteSchema.parse({
  body: { _id: 'note-id', ...note },
});
assert.strictEqual(
  Object.prototype.hasOwnProperty.call(updated.body, 'visibility'),
  false,
  '更新时省略 visibility 应保留原值'
);

assert.throws(
  () =>
    createNoteSchema.parse({
      body: { ...note, visibility: 'friends-only' },
    }),
  '未知可见性必须被拒绝'
);

console.log('note schema contract: passed');
