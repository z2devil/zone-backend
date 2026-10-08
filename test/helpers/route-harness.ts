import { Router } from 'express';
import UserModel from '../../src/api/models/user.model';
import { RESPONSE_CODE_MAP, ResponseType } from '../../src/constant/code';

type Method = 'get' | 'post' | 'put' | 'delete';

interface CallOptions {
  /** 调用者等级；null 表示匿名 */
  lv: number | null;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  params?: Record<string, string>;
}

interface CallResult {
  /** 路由是否存在 */
  found: boolean;
  /** 是否通过全部中间件、到达最终 controller（不会执行 controller） */
  passed: boolean;
  /** 被中间件拦截时的响应 code */
  code?: number;
}

export const CODE = {
  unauthorized: RESPONSE_CODE_MAP[ResponseType.UNAUTHORIZED],
  denied: RESPONSE_CODE_MAP[ResponseType.DENIED],
  error: RESPONSE_CODE_MAP[ResponseType.ERROR],
};

/**
 * 在不连接数据库的情况下执行路由的中间件链（不含最终 controller）。
 */
export async function callRoute(
  router: Router,
  method: Method,
  path: string,
  options: CallOptions
): Promise<CallResult> {
  const layer = (router.stack as any[]).find(
    l => l.route && l.route.path === path && l.route.methods[method]
  );
  if (!layer) return { found: false, passed: false };

  const handles: any[] = layer.route.stack.map((s: any) => s.handle);
  const middlewares = handles.slice(0, -1);

  const model = UserModel as any;
  const originalFindOne = model.findOne;
  model.findOne = () =>
    Promise.resolve(
      options.lv === null
        ? null
        : { _id: 'u1', email: 'u@test.dev', lv: options.lv }
    );

  let code: number | undefined;
  const res: any = {
    locals:
      options.lv === null
        ? {}
        : { _context: { user: { id: 'u1', email: 'u@test.dev' } } },
    status() {
      return this;
    },
    send(body: { code: number }) {
      code = body.code;
      return this;
    },
    setHeader() {
      return this;
    },
  };
  const req: any = {
    method: method.toUpperCase(),
    headers: {},
    query: options.query ?? {},
    body: options.body ?? {},
    params: options.params ?? {},
  };

  let index = 0;
  let passed = false;
  try {
    const next = async (err?: unknown): Promise<void> => {
      if (err) throw err;
      const handle = middlewares[index++];
      if (!handle) {
        passed = true;
        return;
      }
      await handle(req, res, next);
    };
    await next();
  } finally {
    model.findOne = originalFindOne;
  }

  return { found: true, passed, code };
}
