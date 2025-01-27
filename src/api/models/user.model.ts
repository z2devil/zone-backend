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
  role: mongoose.Schema.Types.ObjectId;
  permissions: mongoose.Schema.Types.ObjectId[];
}

// 模板校验规则
const userSchema = schemaFactory({
  email: { type: String, required: true, unique: true },
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
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
});

// save前置钩子
userSchema.pre('save', next => {
  next();
});

// 创建模板 执行之后会自动在mongodb中创建相应的模板
const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;
