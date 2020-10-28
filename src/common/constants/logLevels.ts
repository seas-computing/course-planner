/**
 * Enumerates the valid log levels implemented by our application
 */
export enum WINSTON_LOG_LEVEL {
  ERROR = 'error',
  WARN = 'warn',
  HTTP = 'http',
  INFO = 'info',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
}

/**
 * TypeORM uses a different signature for the `log` function, so we need to
 * provide an overload that uses their log levels
 */
export enum TYPEORM_LOG_LEVEL {
  LOG = 'log',
  INFO = 'info',
  WARN = 'warn'
}

export default WINSTON_LOG_LEVEL;
