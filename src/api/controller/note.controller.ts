import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import {
  createNote,
  findAdjacentNote,
  findNote,
  findNotes,
  removeNote,
  updateNote,
  viewNote,
} from '../service/note.service';

const actorId = (res: Response): string | undefined =>
  res.locals._context?.user.id;

const disableSharedCache = (res: Response) => {
  res.set('Cache-Control', 'private, no-store');
  res.vary('Authorization');
};

export async function findNoteHandler(req: Request, res: Response) {
  disableSharedCache(res);
  const [e, note] = await silentHandle(findNote, req.params, actorId(res));
  return e ? result.error(res, null, e.message) : result(res, note);
}

export async function findNotesHandler(req: Request, res: Response) {
  disableSharedCache(res);
  const [e, notes] = await silentHandle(findNotes, req.query, actorId(res));
  return e ? result.error(res, null, e.message) : result(res, notes);
}

export async function findAdjacentHandler(req: Request, res: Response) {
  disableSharedCache(res);
  const userId = actorId(res);
  const [e, data] = await silentHandle(async () => {
    const note = await findNote({ _id: req.params._id }, userId);
    if (!note) throw new Error('笔记不存在');

    const [prevRes, nextRes] = await Promise.allSettled([
      findAdjacentNote(note.createdAt, 'previous', userId),
      findAdjacentNote(note.createdAt, 'next', userId),
    ]);
    return {
      prev: prevRes.status === 'fulfilled' ? prevRes.value : null,
      next: nextRes.status === 'fulfilled' ? nextRes.value : null,
    };
  });
  return e ? result.error(res, null, e.message) : result(res, data);
}

export async function createNoteHandler(req: Request, res: Response) {
  const params = {
    ...req.body,
    author: actorId(res),
  };
  const [e, note] = await silentHandle(createNote, params);
  return e ? result.error(res, null, e.message) : result(res, note);
}

export async function removeNoteHandler(req: Request, res: Response) {
  const [e] = await silentHandle(
    removeNote,
    req.body._id,
    actorId(res) as string
  );
  return e ? result.error(res, null, e.message) : result(res, null);
}

export async function viewNoteHandler(req: Request, res: Response) {
  disableSharedCache(res);
  // 真实客户端 IP 由 Express trust proxy 解析，不直接读取可伪造的 X-Forwarded-For。
  const [e] = await silentHandle(viewNote, String(req.query._id), req.ip || '');
  return e ? result.error(res, null, e.message) : result(res, null);
}

export async function updateNoteHandler(req: Request, res: Response) {
  const { _id, ...update } = req.body;
  const [e, note] = await silentHandle(
    updateNote,
    _id,
    actorId(res) as string,
    update
  );
  return e ? result.error(res, null, e.message) : result(res, note);
}
