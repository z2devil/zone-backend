import { QueryFilter } from 'mongoose';
import { BaseCrudProvider } from '../common';
import TagModel, { TagDocument } from '../models/tag.model';

const CRUD = BaseCrudProvider<TagDocument, Omit<TagDocument, 'createdAt'>>(
  TagModel
);

/**
 * 查找标签
 */
export const findTags = async (params: QueryFilter<TagDocument>) => {
  const [list, total] = await CRUD.findPaginate(params, ['label'], {
    sort: { createdAt: -1 },
  });

  return {
    total,
    list,
  };
};

export default CRUD;
