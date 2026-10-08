import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import { loadSettings, REQUIRED_SECRET_ENV } from '../src/constant/settings';

const fullEnv = Object.fromEntries(
  REQUIRED_SECRET_ENV.map(name => [name, `test-${name.toLowerCase()}`])
);

// 生产环境缺失密钥时必须 fail-fast，并列出全部缺失的变量名
assert.throws(
  () => loadSettings({ NODE_ENV: 'production' }),
  (error: Error) =>
    REQUIRED_SECRET_ENV.every(name => error.message.includes(name))
);
assert.throws(
  () => loadSettings({ ...fullEnv, NODE_ENV: 'production', JWT_SECRET: '' }),
  /JWT_SECRET/
);

// 生产环境变量齐全时从环境变量读取
const production = loadSettings({ ...fullEnv, NODE_ENV: 'production' });
assert.strictEqual(production.db.password, 'test-mongo_password');
assert.strictEqual(production.redis.password, 'test-redis_password');
assert.strictEqual(production.oss['access-key-id'], 'test-oss_access_key_id');
assert.strictEqual(
  production.oss['access-key-secret'],
  'test-oss_access_key_secret'
);
assert.strictEqual(production.mail.password, 'test-smtp_password');
assert.strictEqual(production.auth['token-secret'], 'test-jwt_secret');
assert.strictEqual(production.ai.apiKey, 'test-ai_api_key');
assert.strictEqual(production.mail.username, 'test-smtp_username');
assert.strictEqual(production.ai.baseURL, 'test-ai_base_url');

// 非生产环境不依赖真实密钥也能加载
const development = loadSettings({ NODE_ENV: 'test' });
assert.ok(development.auth['token-secret'].length > 0);
assert.strictEqual(development.db.password, '');

// 源码中不能再出现明文密钥字段赋值
const source = readFileSync(
  join(__dirname, '../../src/constant/settings.ts'),
  'utf8'
);
assert.doesNotMatch(source, /password:\s*'[^']+'/);
assert.doesNotMatch(source, /'access-key-(id|secret)':\s*'[^']+'/);
assert.doesNotMatch(source, /apiKey:\s*'[^']+'/);
assert.doesNotMatch(source, /'token-secret':\s*'[^']+'/);
// 发件邮箱与 AI 网关地址同样只从环境变量读取
assert.doesNotMatch(source, /username:\s*'[^']+'/);
assert.doesNotMatch(source, /baseURL:\s*'[^']+'/);

console.log('settings contract: passed');
