import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import ROLE_CRUD, {
  findRoles,
  getRolePermissionList,
  updateRolePermission,
} from '../service/role.service';

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

/**
 * 获取角色权限列表
 */
export async function getRolePermissionListHandler(
  req: Request,
  res: Response
) {
  const [e, data] = await silentHandle(
    getRolePermissionList,
    req.params.roleId
  );
  return e ? result.error(res, null, e.message) : result(res, data);
}

/**
 * 设置角色权限
 */
export async function updateRolePermissionHandler(req: Request, res: Response) {
  const { roleId } = req.params;
  const { permissionIds } = req.body;
  const [e, data] = await silentHandle(
    updateRolePermission,
    roleId,
    permissionIds
  );
  return e ? result.error(res, null, e.message) : result(res, data);
}
