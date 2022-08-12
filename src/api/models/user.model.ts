import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

import { Authority } from '../../constant/authority';
import { randomUtil } from '../../utils';

// 模板接口
export interface UserDocument extends BaseDocument {
  email: string;
  avatarPath: string;
  nickname: string;
  lv: number;
}

// 模板校验规则
const userSchema = schemaFactory({
  email: { type: String, required: true },
  avatarPath: {
    type: String,
    required: false,
    default: randomUtil.avatarPath,
  },
  nickname: {
    type: String,
    required: false,
    default: randomUtil.nickname,
  },
  lv: { type: Number, required: false, default: Authority.login },
});

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
