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

  const [list, page] = await CRUD.findPaginate(
    params,
    [
      'type',
      'title',
      'summary',
      'content',
      'createdAt',
      'author',
      'views',
      'tags',
      'bannerPath',
    ],
    {
      populate: [
        {
          path: 'author',
          select: ['email', 'nickname', 'lv', 'avatarPath'],
        },
      ],
      sort: { createdAt: -1 },
    }
  );

  return {
    list: list.map(d => {
      return d.toObject({
        transform: (doc, ret) => {
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
    page,
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
