import assert from 'assert';
import { sendCodeSchema, signSchema } from '../src/api/schema/auth.schema';
import UserModel from '../src/api/models/user.model';

const raw = '  Foo.Bar@Example.COM ';
const normalized = 'foo.bar@example.com';

// 登录与发码入口统一 trim + 小写，保证 Redis key 与查询一致
assert.strictEqual(
  signSchema.parse({ body: { email: raw, code: '123456' } }).body.email,
  normalized
);
assert.strictEqual(
  sendCodeSchema.parse({ query: { email: raw } }).query.email,
  normalized
);

// 创建用户与按邮箱查询在模型层统一规范化
assert.strictEqual(new UserModel({ email: raw }).email, normalized);
const filter = UserModel.findOne({ email: raw }).cast(UserModel) as {
  email: string;
};
assert.strictEqual(filter.email, normalized);

console.log('email normalize contract: passed');
