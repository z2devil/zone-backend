import logger from '../../utils/logger';
import { Response } from 'express';
import { Code, codeType, CodeMessage } from '../../constant/code';

interface OptionsType {
  type?: codeType;
  status?: number;
  message?: unknown;
}

interface SendResType {
  code: number;
  data: unknown;
  message?: unknown;
}

function result(res: Response, data: unknown, options?: OptionsType) {
  options = Object.assign({ type: Code[200] }, options || {});
  const { type, status, message } = options;

  let resStatus = status;

  if (resStatus === undefined) {
    resStatus = Code[200] ? 200 : 409;
  }

  const sendRes: SendResType = {
    code: Code[type as codeType],
    data,
  };

  message && (sendRes.message = message);
  return res.status(resStatus).send(sendRes);
}

// 错误响应
result.error = function (
  res: Response,
  data: unknown,
  message?: unknown,
  status?: number
) {
  logger.error(message || CodeMessage.error);
  this(res, data, {
    type: 'error',
    message: message || CodeMessage.error,
    status: status || 409,
  });
};

// 无权限响应
result.denied = function (res: Response, data: unknown) {
  this(res, data, {
    type: 'denied',
    message: CodeMessage.denied,
    status: 401,
  });
};

export default result;
