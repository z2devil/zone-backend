import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import USER_CRUD from '../service/user.service';

/**
 * 创建用户
 */
export async function createUserHandler(req: Request, res: Response) {
  const [e, user] = await silentHandle(USER_CRUD.create, req.body);

  return e ? result.error(res, null, e.message) : result(res, user);
}

/**
 * 查找用户
 */
export async function findUserHandler(req: Request, res: Response) {
  const [e, user] = await silentHandle(USER_CRUD.find, req.query);

  return e ? result.error(res, null, e.message) : result(res, user);
}
