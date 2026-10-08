import assert from 'assert';
import { installFakeRedis } from './helpers/fake-redis';
import { stubMailer, withServer } from './helpers/http';
import { createApp } from '../src/app';

const redis = installFakeRedis();
stubMailer();

async function run() {
  await withServer(createApp(), async baseURL => {
    // 只信任一层反向代理：req.ip 取 X-Forwarded-For 最后一跳，伪造的前缀无效
    const root = await fetch(`${baseURL}/api/`, {
      headers: { 'X-Forwarded-For': '6.6.6.6, 9.9.9.9' },
    });
    assert.strictEqual((await root.json()).code, 200);
    assert.ok(redis.keys().includes('limit:global:9.9.9.9'));
    assert.ok(!redis.keys().some(key => key.includes('6.6.6.6')));
    // 计数 key 首次创建即设置过期时间
    assert.ok((await redis.ttl('limit:global:9.9.9.9')) > 0);

    // 发码接口按 IP 限流：同一 IP 换不同邮箱也会被拦截
    const codeAs = (ip: string, email: string) =>
      fetch(`${baseURL}/api/auth/code?email=${encodeURIComponent(email)}`, {
        headers: { 'X-Forwarded-For': ip },
      }).then(response => response.json());
    for (let i = 0; i < 10; i++) {
      assert.strictEqual(
        (await codeAs('1.1.1.1', `u${i}@zone.local`)).code,
        200
      );
    }
    assert.strictEqual((await codeAs('1.1.1.1', 'u10@zone.local')).code, 429);

    // 发码接口按邮箱限流：换 IP 也不能无限给同一邮箱发码
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(
        (await codeAs(`2.2.2.${i}`, 'target@zone.local')).code,
        200
      );
      redis.advance(61);
    }
    assert.strictEqual(
      (await codeAs('2.2.2.9', 'target@zone.local')).code,
      429
    );

    // 登录接口按 IP 限流
    const signAs = (ip: string, email: string) =>
      fetch(`${baseURL}/api/auth/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
        body: JSON.stringify({ email, code: '000000' }),
      }).then(response => response.json());
    for (let i = 0; i < 20; i++) {
      assert.notStrictEqual(
        (await signAs('3.3.3.3', `s${i}@zone.local`)).code,
        429
      );
    }
    assert.strictEqual((await signAs('3.3.3.3', 's20@zone.local')).code, 429);

    // 登录接口按邮箱限流
    for (let i = 0; i < 10; i++) {
      assert.notStrictEqual(
        (await signAs(`4.4.4.${i}`, 'victim@zone.local')).code,
        429
      );
    }
    assert.strictEqual(
      (await signAs('4.4.4.99', 'victim@zone.local')).code,
      429
    );

    // 全局限流
    redis.advance(3600);
    let last = 0;
    for (let i = 0; i < 101; i++) {
      const response = await fetch(`${baseURL}/api/`, {
        headers: { 'X-Forwarded-For': '5.5.5.5' },
      });
      last = (await response.json()).code;
    }
    assert.strictEqual(last, 429);
  });
}

run()
  .then(() => console.log('rate limit contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
