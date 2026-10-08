import config from '../../constant/settings';
import getRedisClient from '../../redis/client';
import randomUtil from '../../utils/randomUtil';

const codeKey = (email: string) => config.auth['code-prefix'] + email;
const attemptsKey = (email: string) => `code-attempts-${email}`;
const cooldownKey = (email: string) => `code-cooldown-${email}`;

export type IssueCodeResult =
  | { ok: true; code: string }
  | { ok: false; retryAfter: number };

export type VerifyCodeResult =
  | { status: 'ok' }
  | { status: 'invalid'; remaining: number }
  | { status: 'exhausted' }
  | { status: 'expired' };

/**
 * 签发验证码：冷却锁用 SET NX 原子抢占，签发时重置失败计数
 */
export async function issueCode(email: string): Promise<IssueCodeResult> {
  const client = await getRedisClient();
  const cooling = config.auth['code-cooling-time'];
  const acquired = await client.set(cooldownKey(email), '1', {
    EX: cooling,
    NX: true,
  });
  if (!acquired) {
    const ttl = await client.ttl(cooldownKey(email));
    return { ok: false, retryAfter: ttl > 0 ? ttl : cooling };
  }
  const code = randomUtil.CAPTCHA(config.auth['code-length']);
  await client.del(attemptsKey(email));
  await client.set(codeKey(email), code, {
    EX: config.auth['code-expire-time'],
  });
  return { ok: true, code };
}

/**
 * 撤销验证码（例如邮件发送失败时），允许用户立即重试
 */
export async function revokeCode(email: string) {
  const client = await getRedisClient();
  await client.del([codeKey(email), attemptsKey(email), cooldownKey(email)]);
}

/**
 * 校验验证码：先 INCR 计数再比对，保证并发猜测也只有前 N 次会被比对；
 * 成功后通过 DEL 的返回值认领验证码，保证同一验证码只能成功使用一次。
 */
export async function verifyCode(
  email: string,
  input: string
): Promise<VerifyCodeResult> {
  const client = await getRedisClient();
  const maxAttempts = config.auth['code-life-number'];
  const attempts = await client.incr(attemptsKey(email));
  if (attempts === 1) {
    await client.expire(attemptsKey(email), config.auth['code-expire-time']);
  }
  if (attempts > maxAttempts) {
    await client.del(codeKey(email));
    return { status: 'exhausted' };
  }

  const stored = await client.get(codeKey(email));
  if (!stored) return { status: 'expired' };

  if (stored !== input) {
    if (attempts >= maxAttempts) {
      await client.del(codeKey(email));
      return { status: 'exhausted' };
    }
    return { status: 'invalid', remaining: maxAttempts - attempts };
  }

  const claimed = await client.del(codeKey(email));
  if (claimed !== 1) return { status: 'expired' };
  await client.del(attemptsKey(email));
  return { status: 'ok' };
}
