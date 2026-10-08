import { Express } from 'express';
import express from 'express';
import limit from './limit';
import context from './context';
import response from './response';
import requestObservability from '../observability/request';

export default {
  init: (app: Express) => {
    app.use(requestObservability);
    // CORS 头放在最前，保证解析错误、会话错误等提前返回的响应也带上
    app.use(response);
    // 笔记正文（富文本 JSON）可能超过默认 100kb
    app.use(express.json({ limit: '5mb' }));
    app.use(context);
    app.use('/api', limit);
  },
};
