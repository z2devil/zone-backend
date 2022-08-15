import { FilterQuery } from 'mongoose';
import NoteModel, { NoteDocument } from '../models/note.model';
import { BaseCrudProvider } from '../common';

const CRUD = BaseCrudProvider<NoteDocument, Omit<NoteDocument, 'createdAt'>>(
  NoteModel
);

export default CRUD;

/**
 * 查找笔记
 */
export const findNotes = async (params: FilterQuery<NoteDocument>) => {
  const notes = await NoteModel.find(
    {
      ...params,
      isDeleted: false,
    },
    ['content', 'createdAt', 'author', 'views'],
    {
      sort: { createdAt: -1 },
    }
  ).populate('author', ['email', 'nickname', 'lv', 'avatarPath']);
  return notes.map(note => {
    return note.toObject({
      transform(doc, ret) {
        ret.viewsNum = ret.views?.length;
        delete ret.views;
        return ret;
      },
    });
  });
};

/**
 * 阅读笔记
 */

export const viewNote = async (params: FilterQuery<NoteDocument>) => {
  const { ip, ...restParams } = params;
  const note = await NoteModel.findOne({
    ...restParams,
    isDeleted: false,
  });
  if (!note || note.views.findIndex(i => i === ip) > -1) return;
  note.views.push(ip);
  return await NoteModel.updateOne(
    {
      ...restParams,
      isDeleted: false,
    },
    note
  );
};
