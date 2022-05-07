import mongoose from 'mongoose';
import { Authority } from '../../constants/authority';

// 模板接口
export interface UserDocument extends mongoose.Document {
    email: string;
    avatarPath: string;
    nickname: string;
    lv: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

// 模板校验规则
const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        avatarPath: { type: String, required: true },
        nickname: { type: String, required: true },
        lv: { type: Number, required: false, default: Authority.login },
    },
    {
        timestamps: true,
    }
);

// 建立索引
userSchema.index({ email: 1, deletedAt: 1 }, { unique: true });

// save前置钩子
userSchema.pre('save', next => {
    console.log('save pre 触发');
    next();
});

// 创建模板 执行之后会自动在mongodb中创建相应的模板
const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;
