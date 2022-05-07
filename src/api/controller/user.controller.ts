import { Request, Response } from 'express';
import { commonResult, silentHandle } from '../../utils';
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

    return e
        ? commonResult.error(res, null, e.message)
        : commonResult(res, user);
}

/**
 * 查找用户
 */
export async function findUserHandler(req: Request, res: Response) {
    const [e, user] = await silentHandle(USER_CRUD.find, req.query);

    return e
        ? commonResult.error(res, null, e.message)
        : commonResult(res, user);
}
