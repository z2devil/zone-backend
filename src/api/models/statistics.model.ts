import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface StatisticsDocument extends BaseDocument {
  /** 采集时段（整点毫秒时间戳），同一时段只保留一条。 */
  period: number;
  /** 最近一次采集时间，用于 TTL 清理。 */
  collectedAt: Date;
  wordCount: number;
  noteCount: number;
  viewCount: number;
  likeCount: number;
  contributes: {
    date: number;
    count: number;
  }[];
}

const STATISTICS_RETENTION_SECONDS = 90 * 24 * 60 * 60;

const statisticsSchema = schemaFactory({
  period: { type: Number },
  collectedAt: { type: Date },
  wordCount: { type: Number, default: 0 },
  noteCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  contributes: [
    {
      date: { type: Date, required: true },
      count: { type: Number, required: true },
    },
  ],
});

// 历史文档没有 period，用部分索引避免唯一约束冲突。
statisticsSchema.index(
  { period: 1 },
  { unique: true, partialFilterExpression: { period: { $exists: true } } }
);
statisticsSchema.index(
  { collectedAt: 1 },
  { expireAfterSeconds: STATISTICS_RETENTION_SECONDS }
);

const StatisticsModel = mongoose.model<StatisticsDocument>(
  'Statistics',
  statisticsSchema
);

export default StatisticsModel;
