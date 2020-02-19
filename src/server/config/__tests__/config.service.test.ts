import { strictEqual, deepStrictEqual } from 'assert';
import { int, safeString } from 'testData';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { RedisStoreOptions } from 'connect-redis';
import { AUTH_MODE } from 'common/constants';
import { ConfigService } from '../config.service';

describe('Configuration Service', function () {
  it('reports if the app is in production', function () {
    const config = new ConfigService({
      NODE_ENV: 'production',
    });

    strictEqual(config.isProduction, true);
    strictEqual(config.isDevelopment, false);
  });

  it('reports if the app is in development', function () {
    const config = new ConfigService({
      NODE_ENV: 'development',
    });

    strictEqual(config.isProduction, false);
    strictEqual(config.isDevelopment, true);
  });

  it('provides access to arbitary environment variables', function () {
    const config = new ConfigService({
      DB_HOSTNAME: safeString,
    });

    strictEqual(config.get('DB_HOSTNAME'), safeString);
  });

  describe('database options', function () {
    const DB_HOSTNAME = 'hostname';
    const DB_PORT = int.toString();
    const DB_DATABASE = 'database';
    const DB_USERNAME = 'username';
    const DB_PASSWORD = 'password';

    let dbOptions: PostgresConnectionOptions;

    beforeEach(function () {
      const config = new ConfigService({
        DB_HOSTNAME,
        DB_PORT,
        DB_DATABASE,
        DB_USERNAME,
        DB_PASSWORD,
      });
      ({ dbOptions } = config);
    });

    it('provides the database username', function () {
      strictEqual(dbOptions.username, DB_USERNAME);
    });

    it('provides the database password', function () {
      strictEqual(dbOptions.password, DB_PASSWORD);
    });

    it('provides the database name', function () {
      strictEqual(dbOptions.database, DB_DATABASE);
    });

    it('provides the database port', function () {
      strictEqual(dbOptions.port.toString(), DB_PORT);
    });

    it('provides a glob to import entity classes', function () {
      deepStrictEqual(dbOptions.entities, ['src/server/**/*.entity.ts']);
    });
  });

  describe('redis options', function () {
    const REDIS_HOST = 'hostname';
    const REDIS_PORT = int.toString();
    const REDIS_PASSWORD = 'password';
    const REDIS_PREFIX = safeString;

    let redisOptions: RedisStoreOptions;

    beforeEach(function () {
      const config = new ConfigService({
        REDIS_HOST,
        REDIS_PORT,
        REDIS_PASSWORD,
        REDIS_PREFIX,
      });
      ({ redisOptions } = config);
    });

    it('provides the redis hostname', function () {
      strictEqual(redisOptions.host, REDIS_HOST);
    });

    it('provides the redis port', function () {
      strictEqual(redisOptions.port.toString(), REDIS_PORT);
    });

    it('provides the redis password', function () {
      strictEqual(redisOptions.pass, REDIS_PASSWORD);
    });

    it('provides the redis prefix', function () {
      strictEqual(redisOptions.prefix, REDIS_PREFIX + '_');
    });
  });
  describe('Authentication Mode', function () {
    context('NODE_ENV === production', function () {
      it('Should return Harvard Key mode', function () {
        const config = new ConfigService({
          NODE_ENV: 'production',
        });
        strictEqual(config.authMode, AUTH_MODE.HKEY);
      });
    });
    context('NODE_ENV === development', function () {
      it('Should return development mode', function () {
        const config = new ConfigService({
          NODE_ENV: 'development',
        });
        strictEqual(config.authMode, AUTH_MODE.DEV);
      });
    });
    context('NODE_ENV === testing', function () {
      it('Should return testing mode', function () {
        const config = new ConfigService({
          NODE_ENV: 'testing',
        });
        strictEqual(config.authMode, AUTH_MODE.TEST);
      });
    });
    context('with other NODE_ENV values', function () {
      it('Should return testing mode', function () {
        const config = new ConfigService({
          NODE_ENV: 'travis-ci',
        });
        strictEqual(config.authMode, AUTH_MODE.TEST);
      });
    });
    context('with no NODE_ENV value', function () {
      it('Should return testing mode', function () {
        const config = new ConfigService();
        strictEqual(config.authMode, AUTH_MODE.TEST);
      });
    });
  });
});
