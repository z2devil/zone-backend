import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface NoteDocument extends BaseDocument {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  views: Array<string>;
  viewCount: number;
  bannerPath: string;
  tags: mongoose.Schema.Types.ObjectId[];
}

const noteSchema = schemaFactory({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  views: {
    type: Array,
    required: false,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  bannerPath: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],
});

noteSchema.index({ isDeleted: 1, createdAt: -1 });
noteSchema.index({ isDeleted: 1, tags: 1, createdAt: -1 });

const NoteModel = mongoose.model<NoteDocument>('Note', noteSchema);

export default NoteModel;
