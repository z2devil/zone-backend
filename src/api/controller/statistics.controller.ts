import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import { get } from '../service/statistics.service';

/**
 * 获取数据统计
 */
export async function getStatisticsHandler(req: Request, res: Response) {
  const [e, data] = await silentHandle(get);
  return e ? result.error(res, null, e.message) : result(res, data);
}
