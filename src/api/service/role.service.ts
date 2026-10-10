import { QueryFilter } from 'mongoose';
import { BaseCrudProvider } from '../common';
import RoleModel, { RoleDocument } from '../models/role.model';

const CRUD = BaseCrudProvider<RoleDocument, Omit<RoleDocument, 'createdAt'>>(
  RoleModel
);

export const findRoles = async (params: QueryFilter<RoleDocument>) => {
  const [list, total] = await CRUD.findPaginate(params, ['name', 'createdAt'], {
    sort: { createdAt: -1 },
  });

  return {
    total,
    list,
  };
};

export async function getRolePermissionList(roleId: string) {
  const role = await RoleModel.findById(roleId).populate('permissions');
  return role ? role.permissions : [];
}

export async function updateRolePermission(
  roleId: string,
  permissionIds: string[]
) {
  const updatedRole = await RoleModel.findByIdAndUpdate(
    roleId,
    { permissions: permissionIds },
    { returnDocument: 'after' }
  ).populate('permissions');
  return updatedRole;
}

export default CRUD;
