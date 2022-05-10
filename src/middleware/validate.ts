import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { jwtUtil } from '../utils';
import { result, silentHandle } from '../api/common';
import { Authority } from '../constants/authority';
import { UserDocument } from '../api/models/user.model';
import USER_CRUD from '../api/service/user.service';

/**
 * 校验
 */
const validate =
    (schema: AnyZodObject, authority?: Authority) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('authority:', authority);
            if (authority) {
                const headers = req.headers;
                // 校验token并获取信息
                const { _id } = jwtUtil.verify(headers?.authorization);
                // 判断用户权限是否足够
                const [, users] = await silentHandle<Array<UserDocument>>(
                    USER_CRUD.find,
                    { _id }
                );
                if (!users || users[0].lv < authority) {
                    return result.denied(res, null);
                }
            }
            const parse = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            console.log('parse:', parse);
            req.body = parse.body;
            req.query = parse.query;
            req.params = parse.params;
            next();
        } catch (e: any) {
            return result.error(res, null, e.errors || e.message);
        }
    };

export default validate;
