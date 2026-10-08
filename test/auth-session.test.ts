import assert from 'assert';
import jwt from 'jsonwebtoken';
import { installFakeRedis } from './helpers/fake-redis';
import { withServer } from './helpers/http';
import config from '../src/constant/settings';
import jwtUtil from '../src/utils/jwtUtil';
import { createApp } from '../src/app';
import {
  createSession,
  resolveSession,
  revokeSession,
} from '../src/api/service/auth.session';

const redis = installFakeRedis();
const user = { id: 'user-1', email: 'session@zone.local' };
const DAY = 86400;

async function verifySessions() {
  // 每次登录签发独立 token，多设备互不影响
  const phone = await createSession(user);
  const laptop = await createSession(user);
  assert.notStrictEqual(phone, laptop);

  const phoneSession = await resolveSession(phone);
  assert.ok(phoneSession);
  assert.deepStrictEqual(phoneSession?.user, user);
  assert.ok(await resolveSession(laptop));

  // token 带随机 sid 与 exp
  const payload = jwt.decode(phone) as Record<string, unknown>;
  assert.match(String(payload.sid), /^[a-f0-9]{32}$/);
  assert.strictEqual(typeof payload.exp, 'number');

  // 吊销一个会话不影响其它设备
  await revokeSession(String(phoneSession?.sid));
  assert.strictEqual(await resolveSession(phone), null);
  assert.ok(await resolveSession(laptop));

  // 旧格式（无 sid）与伪造 token 一律无效
  assert.strictEqual(await resolveSession(jwtUtil.create(user)), null);
  assert.strictEqual(await resolveSession('not-a-jwt'), null);
  const expired = jwt.sign(
    { ...user, sid: 'a'.repeat(32), exp: Math.floor(Date.now() / 1000) - 10 },
    config.auth['token-secret']
  );
  assert.strictEqual(await resolveSession(expired), null);
}

async function verifyRenewal() {
  const token = await createSession(user);
  const { sid } = jwt.decode(token) as { sid: string };
  // 30 天有效，临近过期时访问会续期
  assert.strictEqual(await redis.ttl(`session:${sid}`), 30 * DAY);
  redis.advance(29 * DAY);
  assert.ok(await resolveSession(token));
  assert.strictEqual(await redis.ttl(`session:${sid}`), 30 * DAY);
  // 超过 30 天不活跃则失效
  redis.advance(31 * DAY);
  assert.strictEqual(await resolveSession(token), null);
}

async function verifyLogoutRoute() {
  const token = await createSession(user);
  await withServer(createApp(), async baseURL => {
    const logout = () =>
      fetch(`${baseURL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: token },
      }).then(response => response.json());
    const first = await logout();
    assert.strictEqual(first.code, 200);
    // 当前 token 已作废
    assert.strictEqual(await resolveSession(token), null);
    assert.strictEqual((await logout()).code, 401);
  });
}

verifySessions()
  .then(verifyRenewal)
  .then(verifyLogoutRoute)
  .then(() => console.log('auth session contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
