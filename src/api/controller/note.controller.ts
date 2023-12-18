import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import NOTE_CRUD, {
  createNote,
  findAdjacentNote,
  findNote,
  findNotes,
  viewNote,
} from '../service/note.service';

/**
 * 查找笔记
 */
export async function findNoteHandler(req: Request, res: Response) {
  const [e, note] = await silentHandle(findNote, req.params);
  return e ? result.error(res, null, e.message) : result(res, note);
}

/**
 * 查找笔记列表
 */
export async function findNotesHandler(req: Request, res: Response) {
  const [e, notes] = await silentHandle(findNotes, req.query);
  return e ? result.error(res, null, e.message) : result(res, notes);
}

/**
 * 查找相邻笔记
 */
export async function findAdjacentHandler(req: Request, res: Response) {
  const [e, data] = await silentHandle(async () => {
    const note = await findNote({
      _id: req.params._id,
    });
    if (!note) {
      throw new Error('笔记不存在');
    }
    console.log('[ note ]', note);
    const [prevRes, nextRes] = await Promise.allSettled([
      findAdjacentNote(note.createdAt, 'previous'),
      findAdjacentNote(note.createdAt, 'next'),
    ]);
    return {
      prev: prevRes.status === 'fulfilled' ? prevRes.value : null,
      next: nextRes.status === 'fulfilled' ? nextRes.value : null,
    };
  });
  return e ? result.error(res, null, e.message) : result(res, data);
}

/**
 * 发表笔记
 */
export async function createNoteHandler(req: Request, res: Response) {
  const params = {
    ...req.body,
    author: res.locals._context?.user.id,
  };
  const [e, note] = await silentHandle(createNote, params);
  return e ? result.error(res, null, e.message) : result(res, note);
}

/**
 * 删除笔记
 */
export async function removeNoteHandler(req: Request, res: Response) {
  const [e] = await silentHandle(NOTE_CRUD.delete, req.body);
  return e ? result.error(res, null, e.message) : result(res, null);
}

/**
 * 阅读笔记
 */
export async function viewNoteHandler(req: Request, res: Response) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const [e] = await silentHandle(viewNote, { ...req.body, ip });
  return e ? result.error(res, null, e.message) : result(res, null);
}

/**
 * 修改笔记
 */
export async function updateNoteHandler(req: Request, res: Response) {
  const [e, note] = await silentHandle(
    NOTE_CRUD.update,
    {
      _id: req.body._id,
    },
    {
      ...req.body,
      updatedAt: Date.now(),
    }
  );
  return e ? result.error(res, null, e.message) : result(res, note);
}
