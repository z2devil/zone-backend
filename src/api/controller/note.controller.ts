import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import NOTE_CRUD, { findNotes } from '../service/note.service';

/**
 * 查找笔记
 */
export async function findNoteHandler(req: Request, res: Response) {
  const [e, data] = await silentHandle(findNotes, req.query);
  return e ? result.error(res, null, e.message) : result(res, data);
}

/**
 * 发表笔记
 */
export async function createNoteHandler(req: Request, res: Response) {
  const data = {
    ...req.body,
    author: res.locals._context?.user.id,
  };
  const [e] = await silentHandle(NOTE_CRUD.create, data);
  return e ? result.error(res, null, e.message) : result(res, null);
}

/**
 * 删除笔记
 */
export async function removeNoteHandler(req: Request, res: Response) {
  const [e] = await silentHandle(NOTE_CRUD.delete, req.body);
  return e ? result.error(res, null, e.message) : result(res, null);
}
