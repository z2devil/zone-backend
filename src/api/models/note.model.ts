import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface NoteDocument extends BaseDocument {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  views: Array<string>;
  bannerPath: string;
  title: string;
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
});

const NoteModel = mongoose.model<NoteDocument>('Note', noteSchema);

export default NoteModel;
