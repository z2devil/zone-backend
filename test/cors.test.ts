import assert from 'assert';
import { installFakeRedis } from './helpers/fake-redis';
import { withServer } from './helpers/http';
import { createApp } from '../src/app';
import { loadSettings } from '../src/constant/settings';

installFakeRedis();

// 白名单从环境变量读取（逗号分隔），默认包含站点域名与本地开发地址
assert.deepStrictEqual(
  loadSettings({ CORS_ORIGINS: 'https://a.example, https://b.example' })
    .corsOrigins,
  ['https://a.example', 'https://b.example']
);
const defaults = loadSettings({}).corsOrigins;
assert.ok(defaults.includes('https://z2devil.cn'));
assert.ok(defaults.includes('http://localhost:3000'));

async function run() {
  await withServer(createApp(), async baseURL => {
    const allowed = await fetch(`${baseURL}/api/`, {
      headers: { Origin: 'https://z2devil.cn' },
    });
    assert.strictEqual(
      allowed.headers.get('access-control-allow-origin'),
      'https://z2devil.cn'
    );
    assert.match(allowed.headers.get('vary') || '', /Origin/);

    // 非白名单来源不回显
    const evil = await fetch(`${baseURL}/api/`, {
      headers: { Origin: 'https://evil.example' },
    });
    assert.strictEqual(evil.headers.get('access-control-allow-origin'), null);

    // 不再用 Referer 填充 Allow-Origin
    const referer = await fetch(`${baseURL}/api/`, {
      headers: { Referer: 'https://evil.example/page' },
    });
    assert.strictEqual(
      referer.headers.get('access-control-allow-origin'),
      null
    );

    const preflight = await fetch(`${baseURL}/api/note`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'PUT',
      },
    });
    assert.strictEqual(preflight.status, 204);
    assert.strictEqual(
      preflight.headers.get('access-control-allow-origin'),
      'http://localhost:3000'
    );
  });
}

run()
  .then(() => console.log('cors contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
