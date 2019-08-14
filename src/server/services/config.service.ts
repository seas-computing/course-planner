import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { RedisStoreOptions } from 'connect-redis';

/**
 * Parses process.env to create a clean configuration interface
 */

class ConfigService {
  private readonly env: { [key: string]: string };

  public constructor(config: { [key: string]: string} = {}) {
    this.env = config;
  }

  /**
   * Return a single value from the environment
   */

  public get(key: string): string {
    return this.env[key];
  }

  /**
   * Return connection parameters for the Mongoose Module
   */

  public get dbOptions(): PostgresConnectionOptions {
    const {
      DB_HOSTNAME,
      DB_PORT,
      DB_DATABASE,
      DB_USERNAME,
      DB_PASSWORD,
    } = this.env;
    return {
      type: 'postgres',
      database: DB_DATABASE,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      host: DB_HOSTNAME,
      port: parseInt(DB_PORT),
    };
  }

  public get redisOptions(): RedisStoreOptions {
    const {
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD,
      REDIS_PREFIX,
    } = this.env;
    return {
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT),
      pass: REDIS_PASSWORD,
      prefix: REDIS_PREFIX + '_',
    };
  }

  /**
   * check if the app is currently running in production
   */

  public get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  /**
   * check if the app is currently running in development mode
   */

  public get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }
}

export { ConfigService };
