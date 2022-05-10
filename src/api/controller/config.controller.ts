import { Request, Response } from 'express';
import { result, silentHandle } from '../../api/common';
import CONFIG_CRUD from '../service/config.service';
import { CreateConfigInput } from '../schema/config.schema';

export async function createConfigHandler(
    req: Request<{}, {}, CreateConfigInput['body']>,
    res: Response
) {
    const [e, power] = await silentHandle(CONFIG_CRUD.create, req.body);
    return e ? result.error(res, null, e.message) : result(res, power);
}
