import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface TagDocument extends BaseDocument {
  label: string;
}

const tagSchema = schemaFactory({
  label: { type: String, required: true, unique: true },
});

const TagModel = mongoose.model<TagDocument>('Tag', tagSchema);

export default TagModel;
