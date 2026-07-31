import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';
import { NOTE_VISIBILITY, NoteVisibility } from '../../constant/note';

export interface NoteDocument extends BaseDocument {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  views: Array<string>;
  viewCount: number;
  bannerPath: string;
  title: string;
  tags: mongoose.Schema.Types.ObjectId[];
  visibility: NoteVisibility;
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
  visibility: {
    type: String,
    enum: Object.values(NOTE_VISIBILITY),
    default: NOTE_VISIBILITY.public,
    required: true,
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
noteSchema.index({ isDeleted: 1, visibility: 1, createdAt: -1 });
noteSchema.index({ isDeleted: 1, author: 1, createdAt: -1 });

const NoteModel = mongoose.model<NoteDocument>('Note', noteSchema);

export default NoteModel;
