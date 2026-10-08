import assert from 'assert';
import { Types } from 'mongoose';
import jwtUtil from '../src/utils/jwtUtil';

// 与 auth.controller 登录签发的载荷形态一致：id 为 ObjectId
const id = new Types.ObjectId();
const token = jwtUtil.create({ email: 'user@example.com', id });

const info = jwtUtil.verify(token);
assert.ok(typeof info === 'object');
assert.strictEqual(info.email, 'user@example.com');
assert.strictEqual(info.id, id.toHexString());

const [header, payload, signature] = token.split('.');
assert.strictEqual(
  JSON.parse(Buffer.from(header, 'base64url').toString()).alg,
  'HS256'
);

const tampered = `${header}.${payload}.${signature.slice(0, -2)}xx`;
assert.throws(() => jwtUtil.verify(tampered), /token 校验失败/);

console.log('jwt util contract: passed');
