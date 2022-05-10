import express from 'express';
// 全局配置
import config from '../settings';
// 路由
import routes from './routes';
// 日志
import { logger } from './utils';
// 中间件
import initMiddleware from './middleware';
// mongodb
import { dbConnect } from './api/common';

const app = express();

app.use(express.json());

// 挂载中间件
initMiddleware(app);

// 启动
app.listen(config.port, async () => {
    logger.info(`App is running at http://localhost:${config.port}`);
    await dbConnect();
    routes(app);
});
