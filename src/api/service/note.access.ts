import { NOTE_VISIBILITY } from '../../constant/note';

type NoteScope = Record<string, unknown>;

/**
 * 历史数据没有 visibility，灰度期间按公开笔记处理。
 * 未知 visibility 不会命中任何分支，默认隐藏。
 */
export const buildPublicNoteScope = (): NoteScope => ({
  $or: [
    { visibility: NOTE_VISIBILITY.public },
    { visibility: { $exists: false } },
  ],
});

export const buildReadableNoteScope = (author?: unknown): NoteScope => ({
  $or: [
    { visibility: NOTE_VISIBILITY.public },
    { visibility: { $exists: false } },
    ...(author ? [{ visibility: NOTE_VISIBILITY.private, author }] : []),
  ],
});

/** 使用 $and 组合，避免覆盖搜索等业务查询已有的 $or。 */
export const withNoteScope = <T extends NoteScope>(
  filter: T,
  scope: NoteScope
) => ({
  $and: [filter, scope],
});
