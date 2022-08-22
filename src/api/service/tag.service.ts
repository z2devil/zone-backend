import { FilterQuery } from 'mongoose';
import { BaseCrudProvider } from '../common';
import TagModel, { TagDocument } from '../models/tag.model';

const CRUD = BaseCrudProvider<TagDocument, Omit<TagDocument, 'createdAt'>>(
  TagModel
);

/**
 * 查找标签
 */
export const findTags = async (params: FilterQuery<TagDocument>) => {
  const [list, page] = await CRUD.findPaginate(params, ['label'], {
    sort: { createdAt: -1 },
  });

  return {
    list,
    page,
  };
};

export default CRUD;
