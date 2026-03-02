import { Express, Request, Response, Router } from 'express';
import { result } from '../api/common';
import user from './user.routes';
import role from './role.routes';
import permission from './permission.routes';
import power from './config.routes';
import auth from './auth.routes';
import note from './note.routes';
import tag from './tag.routes';
import oss from './oss.routes';
import aggregate from './aggregate.routes';
import statistics from './statistics.routes';
import ai from './ai.routes';

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
  { path: '/role', router: role },
  { path: '/permission', router: permission },
  { path: '/power', router: power },
  { path: '/auth', router: auth },
  { path: '/note', router: note },
  { path: '/tag', router: tag },
  { path: '/oss', router: oss },
  { path: '/aggregate', router: aggregate },
  { path: '/statistics', router: statistics },
  { path: '/ai', router: ai },
];

function routes(app: Express) {
  // 根目录
  app.get(ROOT_PATH + '/', (req: Request, res: Response) =>
    result(res, { word: 'Hello, welcome to z2zone.' })
  );

  routerConf.forEach(conf => app.use(ROOT_PATH + conf.path, conf.router));
}

export default routes;
