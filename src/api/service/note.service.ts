import { FilterQuery } from 'mongoose';
import NoteModel, { NoteDocument } from '../models/note.model';
import { BaseCrudProvider } from '../common';

const CRUD = BaseCrudProvider<NoteDocument, Omit<NoteDocument, 'createdAt'>>(
  NoteModel
);

export default CRUD;

/**
 * 发表笔记
 */
export const createNote = async (params: Partial<NoteDocument>) => {
  console.log('[ createNote ]', params);
  const { _id } = await NoteModel.create(params);
  const note = await NoteModel.findOne(
    {
      _id,
    },
    ['title', 'content', 'createdAt', 'author', 'viewCount', 'tags', 'bannerPath'],
    {
      populate: [
        {
          path: 'author',
          select: ['email', 'nickname', 'lv', 'avatarPath'],
        },
        {
          path: 'tags',
          select: ['label'],
        },
      ],
      sort: { createdAt: -1 },
    }
  );
  return note?.toObject({
    transform: (doc, ret) => {
      ret.viewsNum = ret.viewCount;
      delete ret.viewCount;
      return ret;
    },
  });
};

/**
 * 查找笔记
 */
export const findNote = async (params: FilterQuery<NoteDocument>) => {
  const note = await NoteModel.findOne(
    {
      ...params,
      isDeleted: false,
    },
    ['title', 'content', 'createdAt', 'author', 'viewCount', 'tags', 'bannerPath'],
    {
      populate: [
        {
          path: 'author',
          select: ['email', 'nickname', 'lv', 'avatarPath'],
        },
        {
          path: 'tags',
          select: ['label'],
        },
      ],
      sort: { createdAt: -1 },
    }
  );

  return note?.toObject({
    transform: (doc, ret) => {
      ret.viewsNum = ret.viewCount;
      delete ret.viewCount;
      return ret;
    },
  });
};

/**
 * 查找笔记列表
 */
export const findNotes = async (params: FilterQuery<NoteDocument>) => {
  // 构造干净的 filter 对象
  const filter: any = { isDeleted: false };

  // 处理搜索
  if (params['search']) {
    filter.$or = [
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

  // 处理标签过滤
  if (params.tags) {
    filter.tags = { $in: params.tags.split(',') };
  }

  // 保留分页参数
  filter.current = params.current;
  filter.size = params.size;

  const [list, total] = await CRUD.findPaginate(
    filter,
    ['title', 'content', 'createdAt', 'author', 'viewCount', 'tags', 'bannerPath'],
    {
      populate: [
        {
          path: 'author',
          select: ['email', 'nickname', 'lv', 'avatarPath'],
        },
        {
          path: 'tags',
          select: ['label'],
        },
      ],
      sort: { createdAt: -1 },
    }
  );

  return {
    total,
    list: list.map(d => {
      return d.toObject({
        transform: (doc, ret) => {
          ret.viewsNum = ret.viewCount;
          delete ret.viewCount;
          return ret;
        },
      });
    }),
  };
};

export const findAdjacentNote = async (
  createdAt: number,
  direction: 'previous' | 'next'
) => {
  const isPrevious = direction === 'previous';
  const queryCondition = isPrevious ? { $lt: createdAt } : { $gt: createdAt };
  const sortOrder = isPrevious ? -1 : 1;

  const adjacentNote = await NoteModel.findOne(
    {
      createdAt: queryCondition,
      isDeleted: false,
    },
    ['_id', 'title', 'createdAt'],
    {
      sort: { createdAt: sortOrder },
    }
  );

  return adjacentNote?.toObject();
};

/**
 * 阅读笔记
 */
export const viewNote = async (params: FilterQuery<NoteDocument>) => {
  const { ip, ...restParams } = params;
  return await NoteModel.updateOne(
    { ...restParams, isDeleted: false, views: { $ne: ip } },
    { $push: { views: ip }, $inc: { viewCount: 1 } }
  );
};

/**
 * 修改笔记
 */
export const updateNote = async (
  params: FilterQuery<NoteDocument>,
  update: Partial<NoteDocument>
) => {
  return await NoteModel.findOneAndUpdate(
    {
      ...params,
      isDeleted: false,
    },
    update,
    {
      new: true,
      projection: [
        'title',
        'content',
        'createdAt',
        'author',
        'views',
        'tags',
        'bannerPath',
      ],
      populate: [
        {
          path: 'author',
          select: ['email', 'nickname', 'lv', 'avatarPath'],
        },
        {
          path: 'tags',
          select: ['label'],
        },
      ],
    }
  );
};

/*
 * 获取标签分类列表
 */
export const getCategories = async () => {
  const categories = await NoteModel.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $unwind: '$tags',
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 },
        latestNoteId: { $last: '$_id' },
      },
    },
    {
      $lookup: {
        from: 'notes',
        localField: 'latestNoteId',
        foreignField: '_id',
        as: 'latestNoteData',
      },
    },
    {
      $unwind: '$latestNoteData',
    },
    {
      $lookup: {
        from: 'tags',
        localField: '_id',
        foreignField: '_id',
        as: 'tagData',
      },
    },
    {
      $unwind: '$tagData',
    },
    {
      $project: {
        _id: 1,
        label: '$tagData.label',
        count: 1,
        latestNote: '$latestNoteData',
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
  return categories;
};
