import assert from 'assert';
import mongoose from 'mongoose';
import { installFakeRedis } from './helpers/fake-redis';
import { withServer } from './helpers/http';
import { createApp } from '../src/app';
import { BusinessError, silentHandle, throwHandle } from '../src/api/common';

installFakeRedis();

const castError = new mongoose.Error.CastError(
  'ObjectId',
  'abc',
  '_id'
) as Error;

async function verifyHandles() {
  // 内部异常（如 Mongoose CastError）不透传 message
  const [internal] = await silentHandle(async () => {
    throw castError;
  });
  assert.ok(internal);
  assert.strictEqual(internal?.message, '服务器内部错误');

  await assert.rejects(
    throwHandle(async () => {
      throw castError;
    }),
    (error: Error) => error.message === '服务器内部错误'
  );

  // 主动抛出的业务错误保留文案
  const [business] = await silentHandle(async () => {
    throw new BusinessError('笔记不存在');
  });
  assert.strictEqual(business?.message, '笔记不存在');
}

async function verifyValidationMessage() {
  await withServer(createApp(), async baseURL => {
    const response = await fetch(`${baseURL}/api/auth/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', code: '123456' }),
    });
    const body = await response.json();
    assert.strictEqual(body.code, 400);
    // zod 错误只返回字段级简短信息
    assert.ok(Array.isArray(body.message));
    for (const issue of body.message) {
      assert.deepStrictEqual(Object.keys(issue).sort(), [
        'code',
        'message',
        'path',
      ]);
    }
    assert.deepStrictEqual(body.message[0].path, ['body', 'email']);
  });
}

verifyHandles()
  .then(verifyValidationMessage)
  .then(() => console.log('error message contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
