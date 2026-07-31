import assert from 'assert';
import NoteModel from '../src/api/models/note.model';

const visibility = NoteModel.schema.path('visibility') as any;
assert.ok(visibility, 'Note 模型必须持久化 visibility');
assert.strictEqual(visibility.options.default, 'public');
assert.deepStrictEqual(visibility.options.enum, ['public', 'private']);

const indexes = (
  NoteModel.schema.indexes() as unknown as Array<
    [Record<string, number>, unknown]
  >
).map(([fields]) => fields);
assert.ok(
  indexes.some(
    fields =>
      fields.isDeleted === 1 &&
      fields.visibility === 1 &&
      fields.createdAt === -1
  ),
  '公开流应有 visibility 查询索引'
);
assert.ok(
  indexes.some(
    fields =>
      fields.isDeleted === 1 && fields.author === 1 && fields.createdAt === -1
  ),
  '作者私密流应有 author 查询索引'
);

console.log('note model contract: passed');
