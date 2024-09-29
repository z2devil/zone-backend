import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface StatisticsDocument extends BaseDocument {
  wordCount: number;
  noteCount: number;
  viewCount: number;
  likeCount: number;
  contributes: {
    date: number;
    count: number;
  }[];
}

const statisticsSchema = schemaFactory({
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

const StatisticsModel = mongoose.model<StatisticsDocument>(
  'Statistics',
  statisticsSchema
);

export default StatisticsModel;
