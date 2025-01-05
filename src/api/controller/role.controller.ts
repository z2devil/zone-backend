import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import ROLE_CRUD, { findRoles } from '../service/role.service';

/**
 * 创建角色
 */
export async function createRoleHandler(req: Request, res: Response) {
  const [e, role] = await silentHandle(ROLE_CRUD.create, req.body);
  return e ? result.error(res, null, e.message) : result(res, role);
}

/**
 * 查找角色
 */
export async function findRoleHandler(req: Request, res: Response) {
  const [e, roles] = await silentHandle(findRoles, req.query);
  return e ? result.error(res, null, e.message) : result(res, roles);
}

/**
 * 删除角色
 */
export async function removeRoleHandler(req: Request, res: Response) {
  const [e, role] = await silentHandle(ROLE_CRUD.delete, req.query);
  return e ? result.error(res, null, e.message) : result(res, role);
}

/**
 * 更新角色
 */
export async function updateRoleHandler(req: Request, res: Response) {
  const { _id, name } = req.body;
  const [e, role] = await silentHandle(
    ROLE_CRUD.update,
    { _id },
    {
      name,
    }
  );
  return e ? result.error(res, null, e.message) : result(res, role);
}
