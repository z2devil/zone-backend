import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface NoteDocument extends BaseDocument {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  views: Array<string>;
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

const NoteModel = mongoose.model<NoteDocument>('Note', noteSchema);

export default NoteModel;
