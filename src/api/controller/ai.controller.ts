import { Request, Response } from 'express';
import { result, silentHandle } from '../common';
import { generateTitle, generateSummary } from '../service/ai.service';

export async function generateTitleHandler(req: Request, res: Response) {
  const [e, title] = await silentHandle(generateTitle, req.body.content);
  return e ? result.error(res, null, e.message) : result(res, { title });
}

export async function generateSummaryHandler(req: Request, res: Response) {
  const [e, summary] = await silentHandle(generateSummary, req.body.content);
  return e ? result.error(res, null, e.message) : result(res, { summary });
}
