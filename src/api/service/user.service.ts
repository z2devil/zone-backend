import { FilterQuery } from 'mongoose';
import { BaseCrudProvider } from '../common';
import UserModel, { UserDocument } from '../models/user.model';

const CRUD = BaseCrudProvider<UserDocument, Omit<UserDocument, 'createdAt'>>(
  UserModel
);

/**
 * 查找标签
 */
export const findUsers = async (params: FilterQuery<UserDocument>) => {
  const [list, page] = await CRUD.findPaginate(
    params,
    ['email', 'lv', 'avatarPath', 'nickname', 'createdAt'],
    {
      sort: { createdAt: -1 },
    }
  );

  return {
    list,
    page,
  };
};

export default CRUD;
