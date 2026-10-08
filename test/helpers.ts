/** 记录 controller 写入的响应，避免测试依赖真实 Express。 */
export const createFakeResponse = () => {
  const res: any = {
    locals: {},
    statusCode: 0,
    body: undefined as any,
    headers: {} as Record<string, string>,
    set(name: string, value: string) {
      res.headers[name] = value;
      return res;
    },
    vary() {
      return res;
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    send(body: unknown) {
      res.body = body;
      return res;
    },
  };
  return res;
};
