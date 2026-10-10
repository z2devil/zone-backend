import mongoose, { QueryFilter } from 'mongoose';
import NoteModel, { NoteDocument } from '../models/note.model';
import {
  buildPublicNoteScope,
  buildReadableNoteScope,
  withNoteScope,
} from './note.access';
import getRedisClient from '../../redis/client';
import logger from '../../utils/logger';

const NOTE_PROJECTION =
  'title content createdAt author viewCount tags bannerPath visibility';

const NOTE_POPULATE = [
  {
    path: 'author',
    // 公开接口只返回作者的公开资料；_id 默认保留，供前端判断是否为作者。
    select: ['nickname', 'avatarPath'],
  },
  {
    path: 'tags',
    select: ['label'],
  },
];

const toNoteObject = (note: NoteDocument | null) =>
  note?.toObject({
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.viewsNum = ret.viewCount;
      delete ret.viewCount;
      return ret;
    },
  });

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 正文以 Slate JSON 字符串存储，只在 "text" 叶子节点的值内匹配，
 * 避免命中 type/children 等结构字段。搜索词按 JSON 规则转义，与存储形式一致。
 */
const buildContentSearch = (keyword: string) =>
  new RegExp(
    '"text":"(?:[^"\\\\]|\\\\.)*' +
      escapeRegExp(JSON.stringify(keyword).slice(1, -1)),
    'i'
  );

const readableFilter = (filter: QueryFilter<NoteDocument>, actorId?: unknown) =>
  withNoteScope(
    { ...filter, isDeleted: false },
    buildReadableNoteScope(actorId)
  ) as QueryFilter<NoteDocument>;

const publicFilter = (filter: QueryFilter<NoteDocument>) =>
  withNoteScope(
    { ...filter, isDeleted: false },
    buildPublicNoteScope()
  ) as QueryFilter<NoteDocument>;

/** 发表笔记。模型与参数校验共同保证旧客户端默认公开。 */
export const createNote = async (params: Partial<NoteDocument>) => {
  const { _id } = await NoteModel.create(params);
  return findNote({ _id }, String(params.author));
};

/** 查找当前访客可读的单篇笔记。 */
export const findNote = async (
  params: QueryFilter<NoteDocument>,
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
  params: QueryFilter<NoteDocument>,
  actorId?: string
) => {
  const baseFilter: QueryFilter<NoteDocument> = {};

  if (params.search) {
    const keyword = String(params.search);
    baseFilter.$or = [
      { title: new RegExp(escapeRegExp(keyword), 'i') },
      { content: buildContentSearch(keyword) },
    ];
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

/** 按 (createdAt, _id) 复合顺序取相邻笔记，createdAt 相同时不会被跳过。 */
export const findAdjacentNote = async (
  current: { _id: unknown; createdAt: number },
  direction: 'previous' | 'next',
  actorId?: string
) => {
  const isPrevious = direction === 'previous';
  const op = isPrevious ? '$lt' : '$gt';
  const order = isPrevious ? -1 : 1;
  const adjacentNote = await NoteModel.findOne(
    readableFilter(
      {
        $or: [
          { createdAt: { [op]: current.createdAt } },
          { createdAt: current.createdAt, _id: { [op]: current._id } },
        ],
      },
      actorId
    ),
    '_id title createdAt visibility',
    { sort: { createdAt: order, _id: order } }
  );

  return adjacentNote?.toObject();
};

const VIEW_DEDUPE_SECONDS = 24 * 60 * 60;

/**
 * 同一 IP 对同一笔记 24 小时内只计一次浏览，去重状态存 Redis（带 TTL）。
 * 私密笔记不参与全局浏览量；Redis 故障时放弃计数，不影响阅读。
 */
export const viewNote = async (noteId: string, ip: string) => {
  let firstView: string | null;
  try {
    const redis = await getRedisClient();
    firstView = await redis.set(`view:${noteId}:${ip}`, '1', {
      NX: true,
      EX: VIEW_DEDUPE_SECONDS,
    });
  } catch (error) {
    logger.warn(
      {
        event: 'note_view_dedupe_failed',
        error_type: error instanceof Error ? error.name : 'unknown',
      },
      'Note view dedupe failed'
    );
    return;
  }
  if (!firstView) return;

  await NoteModel.updateOne(publicFilter({ _id: noteId }), {
    $inc: { viewCount: 1 },
  });
};

/** 只有作者本人可以更新，包括切换 visibility。 */
export const updateNote = async (
  noteId: string,
  author: string,
  update: Partial<NoteDocument>
) => {
  return NoteModel.findOneAndUpdate(
    { _id: noteId, author, isDeleted: false } as QueryFilter<NoteDocument>,
    { ...update, updatedAt: Date.now() },
    {
      returnDocument: 'after',
      projection: NOTE_PROJECTION,
      populate: NOTE_POPULATE,
    }
  );
};

/** 只有作者本人可以软删除。返回是否命中（不存在与无权不区分）。 */
export const removeNote = async (noteId: string, author: string) => {
  const { matchedCount } = await NoteModel.updateOne(
    { _id: noteId, author, isDeleted: false } as QueryFilter<NoteDocument>,
    { updatedAt: Date.now(), isDeleted: true }
  );
  return matchedCount > 0;
};

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
        // 分类卡片只展示最新笔记标题，不返回正文、浏览量等内部字段。
        latestNote: { $last: { _id: '$_id', title: '$title' } },
      },
    },
    {
      $lookup: {
        from: 'tags',
        let: { tagId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$tagId'] },
              // 已删除标签不出现在分类中；缺少字段的历史标签视为未删除。
              isDeleted: { $ne: true },
            },
          },
          { $project: { label: 1 } },
        ],
        as: 'tagData',
      },
    },
    { $unwind: '$tagData' },
    {
      $project: {
        _id: 1,
        label: '$tagData.label',
        count: 1,
        latestNote: '$latestNote',
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/** 定时统计只读取公开及历史公开数据。 */
export const findPublicNotesForStatistics = () =>
  NoteModel.find(publicFilter({}), 'content createdAt viewCount');
