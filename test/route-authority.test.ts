import assert from 'assert';
import userRouter from '../src/routes/user.routes';
import tagRouter from '../src/routes/tag.routes';
import { callRoute, CODE } from './helpers/route-harness';

const page = { current: '1', size: '10' };

async function run() {
  // GET /api/user：匿名与普通登录用户都不能列出用户
  let r = await callRoute(userRouter, 'get', '/', { lv: null, query: page });
  assert.strictEqual(r.passed, false);
  assert.strictEqual(r.code, CODE.unauthorized);
  r = await callRoute(userRouter, 'get', '/', { lv: 1, query: page });
  assert.strictEqual(r.passed, false);
  assert.strictEqual(r.code, CODE.denied);
  r = await callRoute(userRouter, 'get', '/', { lv: 2, query: page });
  assert.strictEqual(r.passed, true);

  // POST /api/user：匿名与普通登录用户都不能创建用户
  const body = { email: 'new@test.dev' };
  r = await callRoute(userRouter, 'post', '/', { lv: null, body });
  assert.strictEqual(r.passed, false);
  assert.strictEqual(r.code, CODE.unauthorized);
  r = await callRoute(userRouter, 'post', '/', { lv: 1, body });
  assert.strictEqual(r.passed, false);
  assert.strictEqual(r.code, CODE.denied);
  r = await callRoute(userRouter, 'post', '/', { lv: 2, body });
  assert.strictEqual(r.passed, true);

  // GET /api/user/test：遗留测试接口会向登录用户列出所有用户，已移除
  r = await callRoute(userRouter, 'get', '/test', { lv: 1, query: page });
  assert.strictEqual(r.found, false);

  // DELETE /api/user：原先误绑定查询 handler（匿名可列用户），前端无可达调用方，已移除
  r = await callRoute(userRouter, 'delete', '/', { lv: null, query: page });
  assert.strictEqual(r.found, false);

  // PUT /api/user：仍为登录即可修改自己的资料
  r = await callRoute(userRouter, 'put', '/', {
    lv: 1,
    body: { nickname: 'n' },
  });
  assert.strictEqual(r.passed, true);

  // 标签：读取保持公开，增/改/删需要管理员
  r = await callRoute(tagRouter, 'get', '/', { lv: null, query: page });
  assert.strictEqual(r.passed, true);
  const tagWrites: Array<['post' | 'put' | 'delete', Record<string, unknown>]> =
    [
      ['post', { label: 'tag' }],
      ['put', { _id: 'tag-1', label: 'tag' }],
      ['delete', { _id: 'tag-1' }],
    ];
  for (const [method, tagBody] of tagWrites) {
    r = await callRoute(tagRouter, method, '/', { lv: null, body: tagBody });
    assert.strictEqual(r.code, CODE.unauthorized, `${method} /tag anonymous`);
    r = await callRoute(tagRouter, method, '/', { lv: 1, body: tagBody });
    assert.strictEqual(r.code, CODE.denied, `${method} /tag login`);
    r = await callRoute(tagRouter, method, '/', { lv: 2, body: tagBody });
    assert.strictEqual(r.passed, true, `${method} /tag admin`);
  }
}

run()
  .then(() => console.log('route-authority tests passed'))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
