import { Request, Response } from 'express';
import { commonRes, silentHandle } from '../utils';
import { CreateUserInput, FindUserInput } from '../schema/user.schema';
import USER_CRUD from '../service/user.service';

/**
 * 创建用户
 */
export async function createUserHandler(
    req: Request<{}, {}, CreateUserInput['body']>,
    res: Response
) {
    const [e, user] = await silentHandle(USER_CRUD.create, req.body);

    return e ? commonRes.error(res, null, e.message) : commonRes(res, user);
}

/**
 * 查找用户
 */
export async function findUserHandler(req: Request, res: Response) {
    const [e, user] = await silentHandle(USER_CRUD.find, req.query);

    return e ? commonRes.error(res, null, e.message) : commonRes(res, user);
}
