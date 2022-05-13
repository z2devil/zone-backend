import mongoose from 'mongoose';

export interface BaseDocument extends mongoose.Document {
    createdAt: Number;
    updatedAt: Number;
    isDeleted: Boolean;
}

export const schemaFactory = (params: object) => {
    return new mongoose.Schema(
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
};
