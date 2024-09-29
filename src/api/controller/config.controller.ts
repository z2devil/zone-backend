import { Request, Response } from 'express';
import { result, silentHandle } from '../../api/common';
import CONFIG_CRUD from '../service/config.service';

export async function createConfigHandler(req: Request, res: Response) {
  const [e, config] = await silentHandle(CONFIG_CRUD.create, req.body);
  return e ? result.error(res, null, e.message) : result(res, config);
}

export async function processHandler(req: Request, res: Response) {
  console.log('processHandler', req.body);
  // logger.info('processHandler', req.body);
  return result(res, null);
}

export async function successHandler(req: Request, res: Response) {
  console.log('successHandler：', req.body);
  // logger.info('successHandler', req.body);
  return result(res, null);
}

export async function errorHandler(req: Request, res: Response) {
  console.log('errorHandler', req.body);
  // logger.info('errorHandler', req.body);
  return result(res, null);
}

export async function testHandler(req: Request, res: Response) {
  console.log('testHandler', req.body);

  for (let i = 0; i < 7; i++) {
    const timeout = Math.floor(Math.random() * 100);
    console.log('timeout', timeout);
    await new Promise(resolve => setTimeout(resolve, timeout));
    const response = await fetch('http://localhost:2333/api/scene/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token':
          '***REMOVED***',
      },
      body: JSON.stringify({
        sceneId: '1815567587258404864',
        name: '测试视频',
        format: 'mp4',
        frameWidth: 1920,
        frameHeight: 1080,
        startFrame: 0,
        endFrame: 100,
        successCallback: 'http://localhost:2334/api/power/success',
        errorCallback: 'http://localhost:2334/api/power/error',
        processCallback: 'http://localhost:2334/api/power/process',
      }),
    });

    const { data } = await response.json();

    console.log('[ task ]', data.taskId);
  }

  return result(res, null);
}
