import assert from 'assert';
import { installFakeRedis } from './helpers/fake-redis';
import { withServer } from './helpers/http';
import { createApp } from '../src/app';

installFakeRedis();

async function run() {
  await withServer(createApp(), async baseURL => {
    const post = (body: string) =>
      fetch(`${baseURL}/api/auth/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

    // 超过默认 100kb 的正文（如长笔记）可以正常解析
    const large = await post(
      JSON.stringify({ email: 'big@zone.local', code: 'x'.repeat(300 * 1024) })
    );
    assert.strictEqual(large.status, 400);
    assert.strictEqual((await large.json()).code, 400);

    // 超过上限返回统一 JSON envelope
    const tooLarge = await post(
      JSON.stringify({
        email: 'big@zone.local',
        code: 'x'.repeat(6 * 1024 * 1024),
      })
    );
    assert.strictEqual(tooLarge.status, 413);
    assert.match(tooLarge.headers.get('content-type') || '', /json/);
    assert.strictEqual((await tooLarge.json()).code, 413);

    // 非法 JSON 返回统一 JSON envelope
    const invalid = await post('{"email":');
    assert.strictEqual(invalid.status, 400);
    assert.match(invalid.headers.get('content-type') || '', /json/);
    const body = await invalid.json();
    assert.strictEqual(body.code, 400);
    assert.ok(!JSON.stringify(body).includes('Unexpected'));
  });
}

run()
  .then(() => console.log('body limit contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
