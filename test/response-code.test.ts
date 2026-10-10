import assert from 'assert';
import express from 'express';
import { installFakeRedis } from './helpers/fake-redis';
import { withServer } from './helpers/http';
import { createApp } from '../src/app';
import { result } from '../src/api/common';

installFakeRedis();

async function run() {
  // 未登录 / token 无效：401；HTTP 状态与 body.code 一致
  await withServer(createApp(), async baseURL => {
    for (const headers of [{}, { Authorization: 'not-a-jwt' }] as Record<
      string,
      string
    >[]) {
      const response = await fetch(`${baseURL}/api/auth/info`, { headers });
      assert.strictEqual(response.status, 401);
      assert.strictEqual((await response.json()).code, 401);
    }
  });

  // 已登录但权限不足：403
  const app = express();
  app.get('/denied', (_req, res) => result.denied(res, null));
  app.get('/unauthorized', (_req, res) => result.unauthorized(res, null));
  await withServer(app, async baseURL => {
    const denied = await fetch(`${baseURL}/denied`);
    assert.strictEqual(denied.status, 403);
    assert.strictEqual((await denied.json()).code, 403);
    const unauthorized = await fetch(`${baseURL}/unauthorized`);
    assert.strictEqual((await unauthorized.json()).code, 401);
  });
}

run()
  .then(() => console.log('response code contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
