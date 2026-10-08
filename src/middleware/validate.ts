import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { result, throwHandle } from '../api/common';
import { Authority } from '../constant/authority';
import USER_CRUD from '../api/service/user.service';

/**
 * 校验
 */
const validate =
  (schema?: AnyZodObject | null, authority?: Authority) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (authority) {
        // 从上下文获取当前用户email
        const _user = res.locals._context?.user;
        if (!_user) return result.unauthorized(res, null);
        // 判断用户权限是否足够
        const user = await throwHandle(USER_CRUD.findOne, _user);
        if (!user || user.lv < authority) return result.denied(res, null);
      }
      if (schema) {
        const parse = schema.parse({
          params: req.params,
          query: req.query,
          body: req.body,
        });
        req.body = parse.body;
        req.query = parse.query;
        req.params = parse.params;
      }
      next();
    } catch (e: unknown) {
      // 参数校验错误只返回字段级简短信息
      if (e instanceof ZodError) {
        return result.error(
          res,
          null,
          e.issues.map(({ code, message, path }) => ({ code, message, path }))
        );
      }
      // 其它异常（如权限查询失败）已由 throwHandle 记录日志，对外返回通用错误
      return result.serverError(res, null);
    }
  };

export default validate;
