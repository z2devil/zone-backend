import { Express } from 'express';
import express from 'express';
import limit from './limit';
import context from './context';
import response from './response';

export default {
  init: (app: Express) => {
    app.use(express.json());
    app.use(context);
    app.use(response);
    app.use(limit);
  },
};
