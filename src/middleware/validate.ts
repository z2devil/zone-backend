import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
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
        if (!_user) return result.denied(res, null);
        // 判断用户权限是否足够
        const user = await throwHandle(USER_CRUD.findOne, _user);
        if (!user || user.lv < authority) return result.denied(res, null);
      }
      if (schema) {
        const parse = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        req.body = parse.body;
        req.query = parse.query;
        req.params = parse.params;
      }
      next();
    } catch (e: any) {
      return result.error(res, null, e.errors || e.message);
    }
  };

export default validate;
