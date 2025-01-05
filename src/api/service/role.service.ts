import { FilterQuery } from 'mongoose';
import { BaseCrudProvider } from '../common';
import RoleModel, { RoleDocument } from '../models/role.model';

const CRUD = BaseCrudProvider<RoleDocument, Omit<RoleDocument, 'createdAt'>>(
  RoleModel
);

export const findRoles = async (params: FilterQuery<RoleDocument>) => {
  const [list, total] = await CRUD.findPaginate(params, ['name', 'createdAt'], {
    sort: { createdAt: -1 },
  });

  return {
    total,
    list,
  };
};

export default CRUD;
