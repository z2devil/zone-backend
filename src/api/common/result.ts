import {
  RESPONSE_CODE_MAP,
  RESPONSE_MESSAGE_MAP,
  ResponseType,
} from '../../constant/code';
import { Response } from 'express';
import { getRequestLogger } from '../../observability/request';

interface IOptions {
  code?: number;
  message?: unknown;
}

interface IResponse {
  code: number;
  data: unknown;
  message?: unknown;
}

interface IResult {
  (res: Response, data: unknown, options?: IOptions): Response;
  error(res: Response, data: unknown, message?: unknown): Response;
  denied(res: Response, data: unknown): Response;
  unauthorized(res: Response, data: unknown): Response;
  serverError(res: Response, data: unknown): Response;
}

/**
 * 获取响应结果
 * @param res 响应对象
 * @param data 响应数据
 * @param options 响应配置
 * @returns 响应结果
 */
const result: IResult = (
  res: Response,
  data: unknown,
  options: IOptions = {}
) => {
  const { code = RESPONSE_CODE_MAP[ResponseType.SUCCESS], message } = options;

  const status = RESPONSE_CODE_MAP[ResponseType.SUCCESS];

  const response: IResponse = {
    code,
    data,
  };

  response.message ??= message;

  return res.status(status).send(response);
};

// 错误响应
result.error = function (
  res: Response,
  data: unknown,
  message: unknown = RESPONSE_MESSAGE_MAP[ResponseType.ERROR]
) {
  getRequestLogger(res).error(
    {
      event: 'request_failed',
      response_code: RESPONSE_CODE_MAP[ResponseType.ERROR],
      error_type: message instanceof Error ? message.name : 'application',
    },
    'Request failed'
  );
  return this(res, data, {
    code: RESPONSE_CODE_MAP[ResponseType.ERROR],
    message: message,
  });
};

// 无权限响应
result.denied = function (res: Response, data: unknown) {
  getRequestLogger(res).warn(
    { event: 'authorization_denied' },
    'Authorization denied'
  );
  return this(res, data, {
    code: RESPONSE_CODE_MAP[ResponseType.DENIED],
    message: RESPONSE_MESSAGE_MAP[ResponseType.DENIED],
  });
};

// 未授权响应
result.unauthorized = function (res: Response, data: unknown) {
  getRequestLogger(res).warn(
    { event: 'authentication_required' },
    'Authentication required'
  );
  return this(res, data, {
    code: RESPONSE_CODE_MAP[ResponseType.UNAUTHORIZED],
    message: RESPONSE_MESSAGE_MAP[ResponseType.UNAUTHORIZED],
  });
};

// 服务器内部错误响应：对外只返回通用文案
result.serverError = function (res: Response, data: unknown) {
  return this(res, data, {
    code: RESPONSE_CODE_MAP[ResponseType.SERVER_ERROR],
    message: RESPONSE_MESSAGE_MAP[ResponseType.SERVER_ERROR],
  });
};

export default result;
