import express from 'express';
// 全局配置
import config from './constant/settings';
// 路由
import routes from './routes';
// 日志
import { logger } from './utils';
// 中间件
import middleware from './middleware';
// mongodb
import { connectDB } from './api/common';

const app = express();

// 挂载中间件
middleware.init(app);

// 启动
app.listen(config.port, async () => {
  logger.info(`App is running at http://localhost:${config.port}`);
  await connectDB();
  routes(app);
});
