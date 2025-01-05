import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import PERMISSION_CRUD, {
  findPermissions,
} from '../service/permission.service';

/**
 * 创建权限
 */
export async function createPermissionHandler(req: Request, res: Response) {
  const [e, permission] = await silentHandle(PERMISSION_CRUD.create, req.body);
  return e ? result.error(res, null, e.message) : result(res, permission);
}

/**
 * 删除权限
 */
export async function removePermissionHandler(req: Request, res: Response) {
  const [e, permission] = await silentHandle(PERMISSION_CRUD.delete, req.body);
  return e ? result.error(res, null, e.message) : result(res, permission);
}

/**
 * 查找权限
 */
export async function findPermissionHandler(req: Request, res: Response) {
  const [e, permissions] = await silentHandle(findPermissions, req.query);
  return e ? result.error(res, null, e.message) : result(res, permissions);
}

/**
 * 更新权限
 */
export async function updatePermissionHandler(req: Request, res: Response) {
  const { _id, name, description } = req.body;
  const [e, permission] = await silentHandle(
    PERMISSION_CRUD.update,
    { _id },
    {
      name,
      description,
    }
  );
  return e ? result.error(res, null, e.message) : result(res, permission);
}
