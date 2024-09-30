import { FilterQuery } from 'mongoose';
import { BaseCrudProvider } from '../common';
import StatisticsModel, {
  StatisticsDocument,
} from '../models/statistics.model';

const CRUD = BaseCrudProvider<
  StatisticsDocument,
  Omit<StatisticsDocument, 'createdAt'>
>(StatisticsModel);

/**
 * 数据统计
 */
export const collect = async (params: FilterQuery<StatisticsDocument>) => {
  await CRUD.create(params);
};

/**
 * 获取数据统计
 */
export const get = async () => {
  return CRUD.findOne({}, null, {
    sort: { createdAt: -1 },
  });
};

export default CRUD;
