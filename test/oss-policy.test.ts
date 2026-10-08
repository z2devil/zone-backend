import assert from 'assert';
import { buildUploadPolicy } from '../src/api/controller/oss.controller';

const now = new Date(Date.UTC(2026, 9, 8, 12, 0, 0));
const policy = buildUploadPolicy(now);

// 有效期不超过 10 分钟。
const ttl = new Date(policy.expiration).getTime() - now.getTime();
assert.ok(ttl > 0 && ttl <= 10 * 60 * 1000, `policy 有效期过长：${ttl}ms`);

// 大小上限 50MB（图片与音频共用）。
assert.deepStrictEqual(
  policy.conditions.find(item => item[0] === 'content-length-range'),
  ['content-length-range', 1, 50 * 1024 * 1024]
);

// key 必须位于前端约定的 `${OSS_ROOT}/${fileType}/${filename}` 根目录下。
assert.deepStrictEqual(
  policy.conditions.find(item => item[0] === 'starts-with'),
  ['starts-with', '$key', 'zone/']
);

console.log('oss policy contract: passed');
