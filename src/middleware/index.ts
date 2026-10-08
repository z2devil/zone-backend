import { Express } from 'express';
import express from 'express';
import limit from './limit';
import context from './context';
import response from './response';
import requestObservability from '../observability/request';

export default {
  init: (app: Express) => {
    app.use(requestObservability);
    // 笔记正文（富文本 JSON）可能超过默认 100kb
    app.use(express.json({ limit: '5mb' }));
    app.use(context);
    app.use(response);
    app.use('/api', limit);
  },
};
