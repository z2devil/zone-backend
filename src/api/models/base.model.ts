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
    }
  );

  return schema;
};
