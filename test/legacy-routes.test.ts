import assert from 'assert';
import { AddressInfo } from 'net';
import { createApp } from '../src/app';

/**
 * /api/power/* 为其它项目遗留的测试接口（匿名可写配置、可触发外部请求），应整组下线。
 */
async function run() {
  const server = createApp().listen(0);
  await new Promise<void>(resolve => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;

  try {
    for (const path of ['create', 'process', 'success', 'error', 'test']) {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/power/${path}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        }
      );
      assert.strictEqual(response.status, 404, `/api/power/${path}`);
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  }
}

run()
  .then(() => console.log('legacy routes removed: passed'))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
