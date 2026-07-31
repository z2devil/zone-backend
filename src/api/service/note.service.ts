import mongoose, { FilterQuery } from 'mongoose';
import NoteModel, { NoteDocument } from '../models/note.model';
import {
  buildPublicNoteScope,
  buildReadableNoteScope,
  withNoteScope,
} from './note.access';

const NOTE_PROJECTION = [
  'title',
  'content',
  'createdAt',
  'author',
  'viewCount',
  'tags',
  'bannerPath',
  'visibility',
];

const NOTE_POPULATE = [
  {
    path: 'author',
    select: ['email', 'nickname', 'lv', 'avatarPath'],
  },
  {
    path: 'tags',
    select: ['label'],
  },
];

const toNoteObject = (note: NoteDocument | null) =>
  note?.toObject({
    transform: (_doc, ret) => {
      ret.viewsNum = ret.viewCount;
      delete ret.viewCount;
      return ret;
    },
  });

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readableFilter = (filter: FilterQuery<NoteDocument>, actorId?: unknown) =>
  withNoteScope(
    { ...filter, isDeleted: false },
    buildReadableNoteScope(actorId)
  ) as FilterQuery<NoteDocument>;

const publicFilter = (filter: FilterQuery<NoteDocument>) =>
  withNoteScope(
    { ...filter, isDeleted: false },
    buildPublicNoteScope()
  ) as FilterQuery<NoteDocument>;

/** 发表笔记。模型与参数校验共同保证旧客户端默认公开。 */
export const createNote = async (params: Partial<NoteDocument>) => {
  const { _id } = await NoteModel.create(params);
  return findNote({ _id }, String(params.author));
};

/** 查找当前访客可读的单篇笔记。 */
export const findNote = async (
  params: FilterQuery<NoteDocument>,
  actorId?: string
) => {
  const note = await NoteModel.findOne(
    readableFilter(params, actorId),
    NOTE_PROJECTION,
    {
      populate: NOTE_POPULATE,
      sort: { createdAt: -1 },
    }
  );
  return toNoteObject(note);
};

/** 查找当前访客可读的笔记列表。 */
export const findNotes = async (
  params: FilterQuery<NoteDocument>,
  actorId?: string
) => {
  const baseFilter: FilterQuery<NoteDocument> = {};

  if (params.search) {
    const search = new RegExp(escapeRegExp(String(params.search)), 'i');
    baseFilter.$or = [{ summary: search }, { title: search }];
  }

  if (params.tags) {
    baseFilter.tags = { $in: String(params.tags).split(',') } as any;
  }

  const filter = readableFilter(baseFilter, actorId);
  const current = Number(params.current);
  const size = Number(params.size);

  const query = NoteModel.find(filter, NOTE_PROJECTION, {
    populate: NOTE_POPULATE,
    sort: { createdAt: -1 },
  })
    .skip((current - 1) * size)
    .limit(size);

  const [list, total] = await Promise.all([
    query,
    NoteModel.countDocuments(filter),
  ]);

  return {
    total,
    list: list.map(note => toNoteObject(note)),
  };
};

export const findAdjacentNote = async (
  createdAt: number,
  direction: 'previous' | 'next',
  actorId?: string
) => {
  const isPrevious = direction === 'previous';
  const adjacentNote = await NoteModel.findOne(
    readableFilter(
      {
        createdAt: isPrevious ? { $lt: createdAt } : { $gt: createdAt },
      },
      actorId
    ),
    ['_id', 'title', 'createdAt', 'visibility'],
    { sort: { createdAt: isPrevious ? -1 : 1 } }
  );

  return adjacentNote?.toObject();
};

/** 私密笔记不参与全局浏览量。 */
export const viewNote = async (params: FilterQuery<NoteDocument>) => {
  const { ip, ...noteFilter } = params;
  return NoteModel.updateOne(
    publicFilter({ ...noteFilter, views: { $ne: ip } }),
    { $push: { views: ip }, $inc: { viewCount: 1 } }
  );
};

/** 只有作者本人可以更新，包括切换 visibility。 */
export const updateNote = async (
  noteId: string,
  author: string,
  update: Partial<NoteDocument>
) => {
  return NoteModel.findOneAndUpdate(
    { _id: noteId, author, isDeleted: false },
    { ...update, updatedAt: Date.now() },
    {
      new: true,
      projection: NOTE_PROJECTION,
      populate: NOTE_POPULATE,
    }
  );
};

/** 只有作者本人可以软删除。 */
export const removeNote = async (noteId: string, author: string) =>
  NoteModel.updateOne(
    { _id: noteId, author, isDeleted: false },
    { updatedAt: Date.now(), isDeleted: true }
  );

/** 获取当前访客可见笔记的标签聚合。 */
export const getCategories = async (actorId?: string) => {
  const validActorId =
    actorId && mongoose.Types.ObjectId.isValid(actorId)
      ? new mongoose.Types.ObjectId(actorId)
      : undefined;

  return NoteModel.aggregate([
    {
      $match: readableFilter({}, validActorId),
    },
    { $sort: { createdAt: 1 } },
    { $unwind: '$tags' },
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
    { $unwind: '$latestNoteData' },
    {
      $lookup: {
        from: 'tags',
        localField: '_id',
        foreignField: '_id',
        as: 'tagData',
      },
    },
    { $unwind: '$tagData' },
    {
      $project: {
        _id: 1,
        label: '$tagData.label',
        count: 1,
        latestNote: '$latestNoteData',
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/** 定时统计只读取公开及历史公开数据。 */
export const findPublicNotesForStatistics = () =>
  NoteModel.find(publicFilter({}), ['content', 'createdAt']);
