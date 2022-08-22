import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import TAG_CRUD, { findTags } from '../service/tag.service';

/**
 * 新增标签
 */
export async function createTagHandler(req: Request, res: Response) {
  const [e, tag] = await silentHandle(TAG_CRUD.createOrUpdate, req.body);
  return e ? result.error(res, null, e.message) : result(res, tag);
}

/**
 * 查找标签
 */
export async function findTagHandler(req: Request, res: Response) {
  const [e, tags] = await silentHandle(findTags, req.query);
  return e ? result.error(res, null, e.message) : result(res, tags);
}

/**
 * 删除标签
 */
export async function deleteTagHandler(req: Request, res: Response) {
  const [e] = await silentHandle(TAG_CRUD.delete, req.body);
  return e ? result.error(res, null, e.message) : result(res, null);
}
