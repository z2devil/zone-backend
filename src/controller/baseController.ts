import { Request, Response } from 'express';
import { commonRes, silentHandle } from '../utils';

export default async (
    req: Request<{}, {}, CreateUserInput['body']>,
    res: Response
) => {
    const [e, user] = await silentHandle(USER_CRUD.create, req.body);

    return e ? commonRes.error(res, null, e.message) : commonRes(res, user);
};
