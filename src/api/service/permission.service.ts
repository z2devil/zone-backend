import { QueryFilter } from 'mongoose';
import { BaseCrudProvider } from '../common';
import PermissionModel, {
  PermissionDocument,
} from '../models/permission.model';

const CRUD = BaseCrudProvider<
  PermissionDocument,
  Omit<PermissionDocument, 'createdAt'>
>(PermissionModel);

export const findPermissions = async (
  params: QueryFilter<PermissionDocument>
) => {
  const [list, total] = await CRUD.findPaginate(
    params,
    ['name', 'description', 'createdAt'],
    {
      sort: { createdAt: -1 },
    }
  );

  return {
    total,
    list,
  };
};

export default CRUD;
