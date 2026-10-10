import assert from 'assert';
import express from 'express';
import { installFakeRedis } from './helpers/fake-redis';
import { stubMailer, withServer } from './helpers/http';
import { createApp } from '../src/app';
import { result } from '../src/api/common';
import { asyncHandler, errorHandler } from '../src/middleware/error';
import {
  RESPONSE_CODE_MAP,
  RESPONSE_MESSAGE_MAP,
  ResponseType,
} from '../src/constant/code';

installFakeRedis();
stubMailer();

const ORIGIN = 'https://z2devil.cn';

/** HTTP 状态码必须与 envelope 的 code 一致，且错误响应同样带 CORS 头 */
async function expectAligned(response: Response, code: number) {
  assert.strictEqual(response.status, code);
  assert.match(response.headers.get('content-type') || '', /json/);
  const body = await response.json();
  assert.strictEqual(body.code, code);
  assert.ok('data' in body);
  return body;
}

function expectCors(response: Response) {
  assert.strictEqual(
    response.headers.get('access-control-allow-origin'),
    ORIGIN
  );
}

async function verifyApp() {
  await withServer(createApp(), async baseURL => {
    const get = (path: string, headers: Record<string, string> = {}) =>
      fetch(`${baseURL}${path}`, { headers: { Origin: ORIGIN, ...headers } });

    // 成功：200
    const ok = await get('/api/');
    await expectAligned(ok, 200);
    expectCors(ok);

    // 未登录：401
    const unauthorized = await get('/api/auth/info');
    await expectAligned(unauthorized, 401);
    expectCors(unauthorized);

    // 路由不存在：404 envelope，而不是 Express 默认 HTML
    const missing = await get('/api/not-exists');
    await expectAligned(missing, 404);
    expectCors(missing);

    // 参数错误：400
    const invalid = await fetch(`${baseURL}/api/auth/sign`, {
      method: 'POST',
      headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    await expectAligned(invalid, 400);
    expectCors(invalid);

    // 限流：429
    let limited: Response | undefined;
    for (let i = 0; i < 11; i++) {
      limited = await get(`/api/auth/code?email=s${i}@zone.local`, {
        'X-Forwarded-For': '7.7.7.7',
      });
    }
    await expectAligned(limited as Response, 429);
    expectCors(limited as Response);

    // 健康检查保持原格式
    const live = await get('/health/live');
    assert.strictEqual(live.status, 200);
    assert.strictEqual((await live.json()).status, 'ok');
  });
}

async function verifyResultHelpers() {
  const app = express();
  app.get('/denied', (_req, res) => result.denied(res, null));
  app.get('/not-found', (_req, res) =>
    result(res, null, {
      code: RESPONSE_CODE_MAP[ResponseType.NOT_FOUND],
      message: RESPONSE_MESSAGE_MAP[ResponseType.NOT_FOUND],
    })
  );
  app.get('/error', (_req, res) => result.error(res, null, '参数错误'));
  app.get(
    '/boom',
    asyncHandler(async () => {
      throw new Error('internal detail');
    })
  );
  app.use(errorHandler);

  await withServer(app, async baseURL => {
    await expectAligned(await fetch(`${baseURL}/denied`), 403);
    await expectAligned(await fetch(`${baseURL}/not-found`), 404);
    const error = await expectAligned(await fetch(`${baseURL}/error`), 400);
    assert.strictEqual(error.message, '参数错误');
    const boom = await expectAligned(await fetch(`${baseURL}/boom`), 500);
    assert.strictEqual(boom.message, '服务器内部错误');
  });
}

verifyApp()
  .then(verifyResultHelpers)
  .then(() => console.log('http status contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
