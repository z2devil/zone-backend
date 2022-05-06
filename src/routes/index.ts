import { Express, Request, Response, Router } from 'express';
import { commonRes } from '../utils';
import User from './user.routes';

// 路由配置接口
interface RouterConf {
    path: string;
    router: Router;
    meta?: unknown;
}

// 路由配置
const routerConf: Array<RouterConf> = [{ path: '/user', router: User }];

function routes(app: Express) {
    // 根目录
    app.get('/', (req: Request, res: Response) =>
        commonRes(res, { word: 'Hello Shinp!!!' })
    );

    routerConf.forEach(conf => app.use(conf.path, conf.router));
}

export default routes;
