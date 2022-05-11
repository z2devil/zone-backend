import { Express } from 'express';
import express from 'express';
import responseHeader from './responseHeader';
import context from './context';

export default {
    init: (app: Express) => {
        app.use(express.json());
        app.use(context);
        app.use(responseHeader);
    },
};
