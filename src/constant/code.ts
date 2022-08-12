// 错误码
enum Code {
  success = 200,
  denied,
  error,
}

enum CodeMessage {
  success = '请求成功',
  denied = '无权限',
  error = '请求出错',
}

// 状态类型 只能是Code中所枚举的状态
type codeType = keyof typeof Code;

export { Code, codeType, CodeMessage };
