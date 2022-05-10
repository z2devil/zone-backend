import { Express, Request, Response, Router } from 'express';
import { result } from '../api/common';
import user from './user.routes';
import power from './config.routes';
import auth from './auth.routes';

// 路由配置接口
interface RouterConf {
    path: string;
    router: Router;
    meta?: unknown;
}

// 路由配置
const routerConf: Array<RouterConf> = [
    { path: '/user', router: user },
    { path: '/power', router: power },
    { path: '/auth', router: auth },
];

function routes(app: Express) {
    // 根目录
    app.get('/', (req: Request, res: Response) =>
        result(res, { word: 'Hello Shinp!!!' })
    );

    routerConf.forEach(conf => app.use(conf.path, conf.router));
}

export default routes;
