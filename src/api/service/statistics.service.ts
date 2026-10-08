import { BaseCrudProvider } from '../common';
import StatisticsModel, {
  StatisticsDocument,
} from '../models/statistics.model';

const CRUD = BaseCrudProvider<
  StatisticsDocument,
  Omit<StatisticsDocument, 'createdAt'>
>(StatisticsModel);

export type StatisticsSnapshot = Pick<
  StatisticsDocument,
  | 'period'
  | 'collectedAt'
  | 'wordCount'
  | 'noteCount'
  | 'viewCount'
  | 'likeCount'
  | 'contributes'
>;

/**
 * 数据统计：按时段 upsert，同一时段重复采集只更新同一条记录。
 */
export const collect = async ({ period, ...stats }: StatisticsSnapshot) => {
  await StatisticsModel.updateOne(
    { period },
    { $set: stats },
    { upsert: true }
  );
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
