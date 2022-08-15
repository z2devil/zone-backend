import { Request, Response } from 'express';
import { result, silentHandle } from '../../api/common';
import CONFIG_CRUD from '../service/config.service';

export async function createConfigHandler(req: Request, res: Response) {
  const [e, config] = await silentHandle(CONFIG_CRUD.create, req.body);
  return e ? result.error(res, null, e.message) : result(res, config);
}
