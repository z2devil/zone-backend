import assert from 'assert';
import { installFakeRedis } from './helpers/fake-redis';
import randomUtil from '../src/utils/randomUtil';
import { issueCode, verifyCode } from '../src/api/service/auth.code';

const redis = installFakeRedis();

function verifyCaptcha() {
  const seen = new Set<string>();
  for (let i = 0; i < 2000; i++) {
    const code = randomUtil.CAPTCHA(6);
    assert.match(code, /^\d{6}$/);
    code.split('').forEach(char => seen.add(char));
  }
  // 旧实现 Math.random() * 9 永远取不到 '0'
  assert.strictEqual(seen.size, 10, '验证码应覆盖 0-9 全部数字');
}

async function verifyFlow() {
  const email = 'flow@zone.local';
  const issued = await issueCode(email);
  assert.ok(issued.ok);
  if (!issued.ok) return;
  assert.match(issued.code, /^\d{6}$/);

  // 冷却期内不能重复发送
  const again = await issueCode(email);
  assert.strictEqual(again.ok, false);

  const wrong = issued.code === '000000' ? '111111' : '000000';
  assert.deepStrictEqual(await verifyCode(email, wrong), {
    status: 'invalid',
    remaining: 2,
  });

  // 校验成功后立即删除，不能重复使用
  assert.deepStrictEqual(await verifyCode(email, issued.code), {
    status: 'ok',
  });
  assert.strictEqual((await verifyCode(email, issued.code)).status, 'expired');
}

async function verifyExhaustion() {
  const email = 'exhaust@zone.local';
  const issued = await issueCode(email);
  if (!issued.ok) throw new Error('issue failed');
  const wrong = issued.code === '000000' ? '111111' : '000000';

  assert.strictEqual((await verifyCode(email, wrong)).status, 'invalid');
  assert.strictEqual((await verifyCode(email, wrong)).status, 'invalid');
  assert.strictEqual((await verifyCode(email, wrong)).status, 'exhausted');
  // 次数用尽后验证码作废，正确验证码也不再可用
  assert.notStrictEqual((await verifyCode(email, issued.code)).status, 'ok');
}

async function verifyConcurrentGuesses() {
  const email = 'race@zone.local';
  const issued = await issueCode(email);
  if (!issued.ok) throw new Error('issue failed');
  const guesses = Array.from({ length: 20 }, (_, index) =>
    index === 19 ? issued.code : String(index).padStart(6, '9')
  );
  // 并发猜测时计数必须原子递增，超过次数的请求不能命中
  const results = await Promise.all(
    guesses.map(guess => verifyCode(email, guess))
  );
  assert.ok(results.every(result => result.status !== 'ok'));
}

async function verifyResendResetsAttempts() {
  const email = 'resend@zone.local';
  const first = await issueCode(email);
  if (!first.ok) throw new Error('issue failed');
  await verifyCode(email, 'bad');
  await verifyCode(email, 'bad');
  redis.advance(61);
  const second = await issueCode(email);
  if (!second.ok) throw new Error('resend failed');
  assert.deepStrictEqual(await verifyCode(email, second.code), {
    status: 'ok',
  });
}

verifyCaptcha();
verifyFlow()
  .then(verifyExhaustion)
  .then(verifyConcurrentGuesses)
  .then(verifyResendResetsAttempts)
  .then(() => console.log('auth code contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
