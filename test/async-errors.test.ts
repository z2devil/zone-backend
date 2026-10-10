import assert from 'assert';
import express from 'express';
import { installFakeRedis } from './helpers/fake-redis';
import { stubMailer, withServer } from './helpers/http';
import { createApp, handleUnhandledRejection } from '../src/app';
import { asyncHandler, errorHandler } from '../src/middleware/error';
import jwtUtil from '../src/utils/jwtUtil';

const redis = installFakeRedis();
let mailShouldFail = true;
stubMailer(async () => {
  if (mailShouldFail) throw new Error('smtp auth failed: secret detail');
});

async function verifyAsyncHandler() {
  const app = express();
  app.get(
    '/boom',
    asyncHandler(async () => {
      throw new Error('internal secret detail');
    })
  );
  app.use(errorHandler);
  await withServer(app, async baseURL => {
    const response = await fetch(`${baseURL}/boom`);
    assert.strictEqual(response.status, 500);
    const body = await response.json();
    assert.strictEqual(body.code, 500);
    assert.strictEqual(body.message, '服务器内部错误');
    assert.ok(!JSON.stringify(body).includes('secret'));
  });
}

async function verifyMailFailure() {
  await withServer(createApp(), async baseURL => {
    const send = () =>
      fetch(`${baseURL}/api/auth/code?email=mail@zone.local`).then(response =>
        response.json()
      );
    // 邮件发送失败时返回统一错误，不泄露 SMTP 细节
    const failed = await send();
    assert.strictEqual(failed.code, 500);
    assert.ok(!JSON.stringify(failed).includes('smtp'));
    // 发送失败后验证码被撤销，用户可以立即重试
    mailShouldFail = false;
    assert.strictEqual((await send()).code, 200);
  });
}

async function verifyRedisUnavailableInContext() {
  const token = jwtUtil.create({
    id: 'user-1',
    email: 'ctx@zone.local',
    sid: 'a'.repeat(32),
  });
  redis.failing = true;
  try {
    await withServer(createApp(), async baseURL => {
      const response = await fetch(`${baseURL}/api/auth/info`, {
        headers: { Authorization: token },
      });
      const body = await response.json();
      // Redis 不可用时既不能崩溃，也不能误判为登录失效
      assert.strictEqual(body.code, 500);
    });
  } finally {
    redis.failing = false;
  }
}

function verifyUnhandledRejectionIsLogged() {
  assert.doesNotThrow(() => handleUnhandledRejection(new Error('late')));
}

verifyAsyncHandler()
  .then(verifyMailFailure)
  .then(verifyRedisUnavailableInContext)
  .then(verifyUnhandledRejectionIsLogged)
  .then(() => console.log('async error contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
