import { randomBytes } from 'crypto';
import config from '../../constant/settings';
import getRedisClient from '../../redis/client';
import jwtUtil from '../../utils/jwtUtil';

export interface SessionUser {
  id: string;
  email: string;
}

export interface Session {
  sid: string;
  user: SessionUser;
}

const sessionKey = (sid: string) => config.auth['session-prefix'] + sid;

/**
 * 登录时签发独立会话：JWT 携带随机 sid 与 exp，Redis 保存 sid 白名单
 */
export async function createSession(user: SessionUser) {
  const sid = randomBytes(16).toString('hex');
  // exp 直接写入 payload，兼容 jsonwebtoken 8.x / 9.x
  const exp = Math.floor(Date.now() / 1000) + config.auth['token-max-age'];
  const token = jwtUtil.create({ id: user.id, email: user.email, sid, exp });
  const client = await getRedisClient();
  await client.set(sessionKey(sid), user.id, {
    EX: config.auth['token-expire-time'],
  });
  return token;
}

/**
 * 解析 token：签名、exp 或白名单任一不通过都返回 null；
 * Redis 不可用时抛出异常，由调用方决定如何响应。
 */
export async function resolveSession(token: string): Promise<Session | null> {
  let payload: unknown;
  try {
    payload = jwtUtil.verify(token);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;
  const { id, email, sid } = payload as Record<string, unknown>;
  if (
    typeof id !== 'string' ||
    typeof email !== 'string' ||
    typeof sid !== 'string'
  ) {
    return null;
  }

  const client = await getRedisClient();
  const key = sessionKey(sid);
  if ((await client.get(key)) !== id) return null;

  // 临近过期时续期
  const ttl = await client.ttl(key);
  if (ttl > 0 && ttl < config.auth['token-detect-scope']) {
    await client.expire(key, config.auth['token-expire-time']);
  }
  return { sid, user: { id, email } };
}

/**
 * 作废指定会话
 */
export async function revokeSession(sid: string) {
  const client = await getRedisClient();
  await client.del(sessionKey(sid));
}
