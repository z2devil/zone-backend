import assert from 'assert';
import { AddressInfo } from 'net';
import { createApp } from '../src/app';
import { getReadiness } from '../src/observability/health';

assert.deepStrictEqual(getReadiness(true, true), {
  ready: true,
  dependencies: { mongodb: 'up', redis: 'up' },
});

assert.deepStrictEqual(getReadiness(false, true), {
  ready: false,
  dependencies: { mongodb: 'down', redis: 'up' },
});

assert.deepStrictEqual(getReadiness(true, false), {
  ready: false,
  dependencies: { mongodb: 'up', redis: 'down' },
});

async function verifyHealthRoutes() {
  const server = createApp().listen(0);
  await new Promise<void>(resolve => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;

  try {
    const live = await fetch(`http://127.0.0.1:${port}/health/live`, {
      headers: { 'X-Request-ID': 'health_check_1' },
    });
    assert.strictEqual(live.status, 200);
    assert.strictEqual(live.headers.get('x-request-id'), 'health_check_1');
    assert.deepStrictEqual(await live.json(), {
      status: 'ok',
      service: 'zone-backend',
      version: process.env.APP_VERSION || 'dev',
    });

    const ready = await fetch(`http://127.0.0.1:${port}/health/ready`);
    assert.strictEqual(ready.status, 503);
    const readiness = await ready.json();
    assert.strictEqual(readiness.ready, false);
    assert.match(ready.headers.get('x-request-id') || '', /^req_[a-f0-9]{24}$/);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  }
}

verifyHealthRoutes()
  .then(() => console.log('health contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
