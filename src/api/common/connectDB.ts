import mongoose from 'mongoose';
import config from '../../constant/settings';
import logger from '../../utils/logger';

export default async () => {
  try {
    const connection = await mongoose.connect(config.db.uri, {
      user: config.db.user,
      pass: config.db.password,
      authSource: config.db.source,
    });

    logger.info({ event: 'mongodb_connected' }, 'MongoDB connected');

    return connection;
  } catch (error) {
    logger.error(
      {
        event: 'mongodb_connection_failed',
        error_type: error instanceof Error ? error.name : 'unknown',
      },
      'Could not connect to MongoDB'
    );
    throw error;
  }
};

export function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
