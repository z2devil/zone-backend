import mongoose from 'mongoose';

export interface BaseDocument extends mongoose.Document {
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
}

export const schemaFactory = (params: object) => {
  const schema = new mongoose.Schema(
    {
      ...params,
      createdAt: {
        type: Number,
        default: Date.now,
      },
      updatedAt: {
        type: Number,
        default: Date.now,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: false,
      // Mongoose 7 起默认 false。查询依赖剔除 schema 外字段（分页参数等），显式保持 6.x 行为。
      strictQuery: true,
    }
  );

  return schema;
};
