import assert from 'assert';
import TagModel, { TAG_LABEL_INDEX_NAME } from '../src/api/models/tag.model';

// label 不能再是全局唯一：软删除后的同名标签应允许重新创建
const label = TagModel.schema.path('label') as any;
assert.ok(!label.options.unique, 'label 不应声明全局 unique');

const indexes = TagModel.schema.indexes() as unknown as Array<
  [Record<string, number>, Record<string, unknown>]
>;
const labelIndexes = indexes.filter(([fields]) => fields.label === 1);
assert.strictEqual(labelIndexes.length, 1, 'label 只应有一个索引');
const [fields, options] = labelIndexes[0];
assert.deepStrictEqual(fields, { label: 1 });
assert.strictEqual(options.unique, true);
assert.strictEqual(options.name, TAG_LABEL_INDEX_NAME);
assert.notStrictEqual(TAG_LABEL_INDEX_NAME, 'label_1', '需与旧索引区分名称');
assert.deepStrictEqual(options.partialFilterExpression, { isDeleted: false });

console.log('tag model contract: passed');
