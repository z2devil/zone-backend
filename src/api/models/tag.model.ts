import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface TagDocument extends BaseDocument {
  label: string;
}

// 与旧的全局唯一索引 label_1 区分，迁移见 scripts/migrate-tag-label-index.js
export const TAG_LABEL_INDEX_NAME = 'label_1_active';

const tagSchema = schemaFactory({
  label: { type: String, required: true },
});

// 仅未删除的标签参与唯一约束，软删除后允许重建同名标签
tagSchema.index(
  { label: 1 },
  {
    name: TAG_LABEL_INDEX_NAME,
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

const TagModel = mongoose.model<TagDocument>('Tag', tagSchema);

export default TagModel;
