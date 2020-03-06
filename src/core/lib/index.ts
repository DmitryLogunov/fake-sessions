import Logger from './logger/logger';

const logSettings =
  global.config && Object.keys(global.config).includes('logSettings') ? global.config.logSettings : null;

export const logger: Logger = new Logger(logSettings);
export { DBClient } from './db-client';
