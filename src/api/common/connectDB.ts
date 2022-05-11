import mongoose from 'mongoose';
import config from '../../../settings';
import logger from '../../utils/logger';

export default async () => {
    try {
        const connection = await mongoose.connect(config.db.uri, {
            user: config.db.user,
            pass: config.db.password,
            authSource: config.db.source,
        });

        logger.info('DB connected');

        return connection;
    } catch (error) {
        logger.error('Could not connect to db');
        process.exit(1);
    }
};
