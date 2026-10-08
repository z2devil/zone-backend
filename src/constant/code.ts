enum ResponseType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  DENIED = 'DENIED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
}

const RESPONSE_CODE_MAP = {
  [ResponseType.SUCCESS]: 200,
  [ResponseType.ERROR]: 400,
  // 已登录但权限不足
  [ResponseType.DENIED]: 403,
  // 未登录、token 无效或已过期
  [ResponseType.UNAUTHORIZED]: 401,
  [ResponseType.NOT_FOUND]: 404,
  [ResponseType.BAD_REQUEST]: 409,
  [ResponseType.TOO_MANY_REQUESTS]: 429,
  [ResponseType.SERVER_ERROR]: 500,
  [ResponseType.TIMEOUT]: 504,
};

const RESPONSE_MESSAGE_MAP = {
  [ResponseType.SUCCESS]: '请求成功',
  [ResponseType.ERROR]: '请求出错',
  [ResponseType.DENIED]: '无权限',
  [ResponseType.UNAUTHORIZED]: '未登录或登录已过期',
  [ResponseType.NOT_FOUND]: '资源未找到',
  [ResponseType.BAD_REQUEST]: '无效的请求',
  [ResponseType.TOO_MANY_REQUESTS]: '请求过于频繁',
  [ResponseType.SERVER_ERROR]: '服务器内部错误',
  [ResponseType.TIMEOUT]: '请求超时',
};

export { ResponseType, RESPONSE_CODE_MAP, RESPONSE_MESSAGE_MAP };
