import { Request, Response } from 'express';
import { result, silentHandle, throwHandle } from '../common';
import USER_CRUD, { findUsers } from '../service/user.service';

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
  const [e, users] = await silentHandle(findUsers, req.query);
  return e ? result.error(res, null, e.message) : result(res, users);
}

/**
 * 更新用户
 */
export async function updateUserHandler(req: Request, res: Response) {
  let data: object;
  try {
    // 从上下文获取当前用户信息
    const _user = res.locals._context?.user;
    // 根据email查询用户信息
    const { modifiedCount } = await throwHandle(
      USER_CRUD.update,
      _user,
      req.body
    );
    if (!modifiedCount) {
      return result.error(res, null, '更新失败');
    }
    // 获取用户部分属性
    const [e, user] = await silentHandle(USER_CRUD.findOne, _user);
    if (e) {
      return result.error(res, null, e.message);
    }
    if (!user) {
      return result.error(res, null, '更新失败');
    }
    const { email, lv, nickname, avatarPath } = user;
    // 返回当前请求携带的会话 token
    const token = res.locals._context?.token;
    // 对结果赋值
    data = {
      info: {
        email,
        lv,
        nickname,
        avatarPath,
      },
      token,
    };
  } catch (e: any) {
    return result.error(res, null, e.message);
  }
  return result(res, data);
}

/**
 * 获取用户列表
 */
export async function findUserListHandler(req: Request, res: Response) {
  const [e, users] = await silentHandle(USER_CRUD.findPaginate, req.query);
  return e ? result.error(res, null, e.message) : result(res, users);
}
