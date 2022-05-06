// 连接db

import mongoose from 'mongoose';
import config from '../../settings';
import logger from './logger';

async function dbConnect() {
    try {
        const connection = await mongoose.connect(config.dbUri, {
            user: config.dbUser,
            pass: config.dbPassword,
            authSource: config.dbAuthSource,
        });

        logger.info('DB connected');

        return connection;
    } catch (error) {
        logger.error('Could not connect to db');
        process.exit(1);
    }
}

export default dbConnect;
