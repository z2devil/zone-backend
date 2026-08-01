import { Request, Response } from 'express';
import { result, silentHandle } from '../../api/common';
import CONFIG_CRUD from '../service/config.service';
import { getRequestLogger } from '../../observability/request';

export async function createConfigHandler(req: Request, res: Response) {
  const [e, config] = await silentHandle(CONFIG_CRUD.create, req.body);
  return e ? result.error(res, null, e.message) : result(res, config);
}

export async function processHandler(req: Request, res: Response) {
  getRequestLogger(res).info(
    { event: 'scene_export_progress_received' },
    'Scene export progress received'
  );
  return result(res, null);
}

export async function successHandler(req: Request, res: Response) {
  getRequestLogger(res).info(
    { event: 'scene_export_succeeded' },
    'Scene export succeeded'
  );
  return result(res, null);
}

export async function errorHandler(req: Request, res: Response) {
  getRequestLogger(res).warn(
    { event: 'scene_export_failed' },
    'Scene export failed'
  );
  return result(res, null);
}

export async function testHandler(req: Request, res: Response) {
  const accessToken = process.env.SCENE_TEST_ACCESS_TOKEN;
  if (!accessToken) {
    return result.error(res, null, '测试访问令牌未配置');
  }

  const requestLogger = getRequestLogger(res);
  requestLogger.info(
    { event: 'scene_export_test_started' },
    'Scene export test started'
  );

  for (let i = 0; i < 7; i++) {
    const timeout = Math.floor(Math.random() * 100);
    await new Promise(resolve => setTimeout(resolve, timeout));
    const response = await fetch('http://localhost:2333/api/scene/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': accessToken,
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

    requestLogger.debug(
      { event: 'scene_export_task_created', task_id: data.taskId },
      'Scene export task created'
    );
  }

  requestLogger.info(
    { event: 'scene_export_test_finished', task_count: 7 },
    'Scene export test finished'
  );
  return result(res, null);
}
