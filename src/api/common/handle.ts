import logger from '../../observability/logger';
import { RESPONSE_MESSAGE_MAP, ResponseType } from '../../constant/code';

/**
 * 业务错误：message 面向用户，可以原样返回给前端
 */
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}

/**
 * 业务错误原样保留；其它异常记录日志后替换为通用文案，避免透传内部信息
 */
function toPublicError(e: unknown): Error {
  if (e instanceof BusinessError) return e;
  logger.error(
    {
      event: 'internal_error',
      error_type: e instanceof Error ? e.name : typeof e,
      error_message: e instanceof Error ? e.message : String(e),
    },
    'Internal error'
  );
  return new Error(RESPONSE_MESSAGE_MAP[ResponseType.SERVER_ERROR]);
}

async function silentHandle<
  Args extends Array<unknown>,
  Res,
  Err extends Error
>(
  fn: (...args: Args) => Promise<Res> | Res,
  ...args: Args
): Promise<[Err, null] | [null, Res]> {
  let result: [Err, null] | [null, Res];

  try {
    result = [null, await fn(...args)];
  } catch (e: unknown) {
    result = [toPublicError(e) as Err, null];
  }

  return result;
}

async function throwHandle<Args extends Array<unknown>, Res>(
  fn: (...args: Args) => Promise<Res>,
  ...args: Args
): Promise<Res> {
  let result: Res;

  try {
    result = await fn(...args);
  } catch (e: unknown) {
    throw toPublicError(e);
  }

  return result;
}

export { throwHandle, silentHandle };
