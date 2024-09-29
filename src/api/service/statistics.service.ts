import { FilterQuery } from 'mongoose';
import { BaseCrudProvider } from '../common';
import StatisticsModel, {
  StatisticsDocument,
} from '../models/statistics.model';
import mongoose from 'mongoose';

const STATISTICS_ID = new mongoose.Types.ObjectId();

const CRUD = BaseCrudProvider<
  StatisticsDocument,
  Omit<StatisticsDocument, 'createdAt'>
>(StatisticsModel);

/**
 * 数据统计
 */
export const collect = async (params: FilterQuery<StatisticsDocument>) => {
  await CRUD.createOrUpdate({ ...params, _id: STATISTICS_ID });
};

/**
 * 获取数据统计
 */
export const get = async () => {
  return CRUD.findOne({
    _id: STATISTICS_ID,
  });
};

export default CRUD;
