import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export enum NoteType {
  Normal = 0,
  Article,
}

export interface NoteDocument extends BaseDocument {
  type: NoteType;
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  views: Array<string>;
  bannerPath: string;
  title: string;
  summary: string;
  tags: mongoose.Schema.Types.ObjectId[];
}

const noteSchema = schemaFactory({
  type: {
    type: Number,
    required: false,
    default: NoteType.Normal,
  },
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
  summary: {
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

const query = NoteModel.find();

export default NoteModel;
