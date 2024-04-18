import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import { getCategories } from '../service/note.service';

/**
 * 获取标签分类列表
 */
export async function categoryHandler(req: Request, res: Response) {
  const [e, data] = await silentHandle(getCategories);
  return e ? result.error(res, null, e.message) : result(res, data);
}
