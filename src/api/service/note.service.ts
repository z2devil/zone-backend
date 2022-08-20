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
  if (params['search']) {
    params.$or = [
      {
        summary: {
          $regex: new RegExp(params['search']),
        },
      },
      {
        title: {
          $regex: new RegExp(params['search']),
        },
      },
    ];
  }

  const query = NoteModel.find(
    {
      ...params,
      isDeleted: false,
    },
    [
      'type',
      'title',
      'summary',
      'content',
      'createdAt',
      'author',
      'views',
      'tags',
    ]
  )
    .populate('author', ['email', 'nickname', 'lv', 'avatarPath'])
    .skip((params.current - 1) * params.size)
    .limit(params.size)
    .sort({ createdAt: -1 });

  const count = NoteModel.count({
    ...params,
    isDeleted: false,
  });

  const [notes, dataTotal] = await Promise.all([query, count]);

  return {
    list: notes.map(note => {
      return note.toObject({
        transform(doc, ret) {
          ret.viewsNum = ret.views?.length;
          delete ret.views;
          if (!ret.type) {
            delete ret.title;
            delete ret.summary;
          }
          return ret;
        },
      });
    }),
    page: {
      current: params.current,
      size: params.size,
      total: dataTotal,
    },
  };
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
