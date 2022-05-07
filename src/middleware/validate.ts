import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { commonResult, jwtUtil, silentHandle } from '../utils';
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
                const authInfo = jwtUtil.verify(headers?.authorization);
                // 判断用户信息是否足够
                const [, users] = await silentHandle<Array<UserDocument>>(
                    USER_CRUD.find,
                    {
                        _id: authInfo._id,
                    }
                );
                if (!users || users[0].lv < authority) {
                    return commonResult.denied(res, null);
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
            return commonResult.error(res, null, e.errors || e.message);
        }
    };

export default validate;
