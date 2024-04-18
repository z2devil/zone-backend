import { Express, Request, Response, Router } from 'express';
import { result } from '../api/common';
import user from './user.routes';
import power from './config.routes';
import auth from './auth.routes';
import note from './note.routes';
import tag from './tag.routes';
import oss from './oss.routes';
import aggregate from './aggregate.routes';

// 路由配置接口
interface RouterConf {
  path: string;
  router: Router;
  meta?: unknown;
}

const ROOT_PATH = '/api';

// 路由配置
const routerConf: Array<RouterConf> = [
  { path: '/user', router: user },
  { path: '/power', router: power },
  { path: '/auth', router: auth },
  { path: '/note', router: note },
  { path: '/tag', router: tag },
  { path: '/oss', router: oss },
  { path: '/aggregate', router: aggregate },
];

function routes(app: Express) {
  // 根目录
  app.get(ROOT_PATH + '/', (req: Request, res: Response) =>
    result(res, { word: 'Hello, welcome to z2zone.' })
  );

  routerConf.forEach(conf => app.use(ROOT_PATH + conf.path, conf.router));
}

export default routes;
