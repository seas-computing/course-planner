import { strictEqual, throws, notStrictEqual } from 'assert';
import { int, safeString } from 'testData';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AUTH_MODE } from 'common/constants';
import FakeTimers from '@sinonjs/fake-timers';
import { RedisStore } from 'connect-redis';
import { SessionOptions } from 'express-session';
import { ConfigService } from '../config.service';
import { LOG_LEVEL } from '../../../common/constants';

/**
 * The months of the year starting at 0.
 * The Date object expects months of the year to start at 0.
 */
enum MONTH {
  JAN = 0,
  FEB,
  MAR,
  APR,
  MAY,
  JUN,
  JUL,
  AUG,
  SEP,
  OCT,
  NOV,
  DEC,
}

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

  describe('clientBaseURL', function () {
    const CLIENT_URL = 'https://planning.seas.harvard.edu/courses';
    context('When the CLIENT_URL is perfect', function () {
      it('returns the CLIENT_URL', function () {
        const config = new ConfigService({ CLIENT_URL });
        strictEqual(config.clientBaseURL, CLIENT_URL);
      });
    });
    context('When the CLIENT_URL has a trailing slash', function () {
      const trailingURL = `${CLIENT_URL}/`;
      it('returns the CLIENT_URL without the slash', function () {
        const config = new ConfigService({ CLIENT_URL: trailingURL });
        notStrictEqual(config.clientBaseURL, trailingURL);
        strictEqual(config.clientBaseURL, CLIENT_URL);
      });
    });
    context('When the CLIENT_URL has extra elements', function () {
      const messyURL = 'https://user:password@planning.seas.harvard.edu/courses?q=abcdefg#anchor';
      it('returns the CLIENT_URL without those elements', function () {
        const config = new ConfigService({ CLIENT_URL: messyURL });
        notStrictEqual(config.clientBaseURL, messyURL);
        strictEqual(config.clientBaseURL, CLIENT_URL);
      });
    });
    context('When the CLIENT_URL is invalid', function () {
      it('throws an error', function () {
        const config = new ConfigService({ CLIENT_URL: safeString });
        throws(
          () => config.clientBaseURL,
          new RegExp(`Invalid URL: ${safeString}`)
        );
      });
    });
    context('When the CLIENT_URL is missing', function () {
      it('throws an error', function () {
        const config = new ConfigService({ });
        throws(
          () => config.clientBaseURL,
          /Invalid URL: undefined/
        );
      });
    });
  });

  describe('casServiceURL', function () {
    const SERVER_URL = 'https://computingapps.seas.harvard.edu/course-planner';
    context('When the SERVER_URL is perfect', function () {
      it('returns the SERVER_URL + /validate', function () {
        const config = new ConfigService({ SERVER_URL });
        strictEqual(config.casServiceURL, `${SERVER_URL}/validate`);
      });
    });
    context('When the SERVER_URL has a trailing slash', function () {
      const trailingURL = `${SERVER_URL}/`;
      it('Does not return a double-slash (//) before validate', function () {
        const config = new ConfigService({ SERVER_URL: trailingURL });
        notStrictEqual(config.casServiceURL, `${SERVER_URL}//validate`);
        strictEqual(config.casServiceURL, `${SERVER_URL}/validate`);
      });
    });
    context('When the SERVER_URL has extra elements', function () {
      const messyURL = 'https://user:password@computingapps.seas.harvard.edu/course-planner?q=abcdefg#anchor';
      it('returns the validation endpoint without those elements', function () {
        const config = new ConfigService({ SERVER_URL: messyURL });
        notStrictEqual(config.casServiceURL, messyURL);
        strictEqual(config.casServiceURL, `${SERVER_URL}/validate`);
      });
    });
    context('When the SERVER_URL is invalid', function () {
      it('throws an error', function () {
        const config = new ConfigService({ SERVER_URL: safeString });
        throws(
          () => config.casServiceURL,
          new RegExp(`Invalid URL: ${safeString}`)
        );
      });
    });
    context('When the SERVER_URL is missing', function () {
      it('throws an error', function () {
        const config = new ConfigService({ });
        throws(
          () => config.casServiceURL,
          /Invalid URL: undefined/
        );
      });
    });
  });

  describe('casBaseURL', function () {
    const CAS_URL = 'https://auth.harvard.edu/cas';
    context('When the CAS_URL is perfect', function () {
      it('returns the CAS_URL', function () {
        const config = new ConfigService({ CAS_URL });
        strictEqual(config.casBaseURL, CAS_URL);
      });
    });
    context('When the CAS_URL has a trailing slash', function () {
      const trailingURL = `${CAS_URL}/`;
      it('returns the CAS_URL without the slash', function () {
        const config = new ConfigService({ CAS_URL: trailingURL });
        notStrictEqual(config.casBaseURL, trailingURL);
        strictEqual(config.casBaseURL, CAS_URL);
      });
    });
    context('When the CAS_URL has extra elements', function () {
      const messyURL = 'https://user:password@auth.harvard.edu/cas?q=abcdefg#anchor';
      it('returns the CAS_URL without those elements', function () {
        const config = new ConfigService({ CAS_URL: messyURL });
        notStrictEqual(config.casBaseURL, messyURL);
        strictEqual(config.casBaseURL, CAS_URL);
      });
    });
    context('When the CAS_URL is invalid', function () {
      it('throws an error', function () {
        const config = new ConfigService({ CAS_URL: safeString });
        throws(
          () => config.casBaseURL,
          new RegExp(`Invalid URL: ${safeString}`)
        );
      });
    });
    context('When the CAS_URL is missing', function () {
      it('throws an error', function () {
        const config = new ConfigService({ });
        throws(
          () => config.casBaseURL,
          /Invalid URL: undefined/
        );
      });
    });
  });

  describe('database options', function () {
    let dbOptions: PostgresConnectionOptions;
    const DB_HOSTNAME = 'hostname';
    const DB_PORT = int.toString();
    const DB_DATABASE = 'database';
    const DB_USERNAME = 'username';
    const DB_PASSWORD = 'password';
    context('In production mode', function () {
      const NODE_ENV = 'production';

      beforeEach(function () {
        const config = new ConfigService({
          DB_HOSTNAME,
          DB_PORT,
          DB_DATABASE,
          DB_USERNAME,
          DB_PASSWORD,
          NODE_ENV,
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
    });
    context('In development mode', function () {
      const NODE_ENV = 'development';

      beforeEach(function () {
        const config = new ConfigService({
          DB_HOSTNAME,
          DB_PORT,
          DB_DATABASE,
          DB_USERNAME,
          DB_PASSWORD,
          NODE_ENV,
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
    });
  });

  describe('redis URL', function () {
    const REDIS_HOST = 'hostname';
    const REDIS_PORT = int.toString();
    const REDIS_PASSWORD = 'password';
    const REDIS_PREFIX = safeString;

    let redisURL: URL;
    context('In Production', function () {
      context('With a Password', function () {
        beforeEach(function () {
          const config = new ConfigService({
            REDIS_HOST,
            REDIS_PORT,
            REDIS_PASSWORD,
            REDIS_PREFIX,
            NODE_ENV: 'production',
          });
          redisURL = new URL(config.redisURL);
        });

        it('provides the redis hostname', function () {
          strictEqual(redisURL.hostname, REDIS_HOST);
        });

        it('provides the redis port', function () {
          strictEqual(redisURL.port.toString(), REDIS_PORT);
        });

        it('provides the redis password', function () {
          strictEqual(redisURL.password, REDIS_PASSWORD);
        });

        it('Sets the protocol to "rediss:"', function () {
          strictEqual(redisURL.protocol, 'rediss:');
        });
      });
      context('Without a Password', function () {
        beforeEach(function () {
          const config = new ConfigService({
            REDIS_HOST,
            REDIS_PORT,
            REDIS_PREFIX,
            NODE_ENV: 'production',
          });
          redisURL = new URL(config.redisURL);
        });

        it('provides the redis hostname', function () {
          strictEqual(redisURL.hostname, REDIS_HOST);
        });

        it('provides the redis port', function () {
          strictEqual(redisURL.port.toString(), REDIS_PORT);
        });

        it('does not provide a redis password', function () {
          strictEqual(redisURL.password, '');
        });

        it('Sets the protocol to "rediss:"', function () {
          strictEqual(redisURL.protocol, 'rediss:');
        });
      });
    });
    context('In Development', function () {
      context('With a Password', function () {
        beforeEach(function () {
          const config = new ConfigService({
            REDIS_HOST,
            REDIS_PORT,
            REDIS_PASSWORD,
            REDIS_PREFIX,
            NODE_ENV: 'development',
          });
          redisURL = new URL(config.redisURL);
        });

        it('provides the redis hostname', function () {
          strictEqual(redisURL.hostname, REDIS_HOST);
        });

        it('provides the redis port', function () {
          strictEqual(redisURL.port.toString(), REDIS_PORT);
        });

        it('provides the redis password', function () {
          strictEqual(redisURL.password, REDIS_PASSWORD);
        });

        it('Sets the protocol to "redis:"', function () {
          strictEqual(redisURL.protocol, 'redis:');
        });
      });
      context('Without a Password', function () {
        beforeEach(function () {
          const config = new ConfigService({
            REDIS_HOST,
            REDIS_PORT,
            REDIS_PREFIX,
            NODE_ENV: 'development',
          });
          redisURL = new URL(config.redisURL);
        });

        it('provides the redis hostname', function () {
          strictEqual(redisURL.hostname, REDIS_HOST);
        });

        it('provides the redis port', function () {
          strictEqual(redisURL.port.toString(), REDIS_PORT);
        });

        it('does not provide a redis password', function () {
          strictEqual(redisURL.password, '');
        });

        it('Sets the protocol to "redis:"', function () {
          strictEqual(redisURL.protocol, 'redis:');
        });
      });
    });
  });
  describe('Session Settings', function () {
    const SESSION_SECRET = safeString;
    const SERVER_DOMAIN = 'computingapps.seas.harvard.edu';
    const SERVER_PATH = '/course-planner';
    const SERVER_URL = `https://${SERVER_DOMAIN}${SERVER_PATH}`;
    let sessionSettings: SessionOptions;
    let testStore: RedisStore;
    beforeEach(function () {
      const config = new ConfigService({
        SERVER_URL,
        SESSION_SECRET,
      });
      testStore = {} as RedisStore;
      ({ session: sessionSettings } = config.getSessionSettings(testStore));
    });
    it('Should return the store parameter as "store"', function () {
      strictEqual(sessionSettings.store, testStore);
    });
    it('Should provide the session secret', function () {
      strictEqual(sessionSettings.secret, SESSION_SECRET);
    });
    it('Should provide the cookie path', function () {
      strictEqual(sessionSettings.cookie.path, SERVER_PATH);
    });
    it('Should provide the cookie domain', function () {
      strictEqual(sessionSettings.cookie.domain, SERVER_DOMAIN);
    });
    it('Should provide a cookie maxAge of 12 hours', function () {
      strictEqual(sessionSettings.cookie.maxAge, 1000 * 60 * 60 * 12);
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
  describe('Academic Year Calculation', function () {
    let clock: FakeTimers.InstalledClock;
    let config: ConfigService;
    before(function () {
      clock = FakeTimers.install();
      config = new ConfigService();
    });
    after(function () {
      clock.uninstall();
    });
    context('on January 1st', function () {
      it('should return the current calendar year as the academic year', function () {
        const testYear = 2020;
        clock.setSystemTime(new Date(testYear, MONTH.JAN, 1, 0, 0, 0));
        strictEqual(config.academicYear, testYear);
      });
    });
    context('between Jan 1st and June 30th', function () {
      it('should return the current calendar year as the academic year', function () {
        const testYear = 2021;
        clock.setSystemTime(new Date(testYear, MONTH.MAY, 13, 6, 29, 19));
        strictEqual(config.academicYear, testYear);
      });
    });
    context('on June 30th', function () {
      it('should return the current calendar year as the academic year', function () {
        const testYear = 2030;
        clock.setSystemTime(new Date(testYear, MONTH.JUN, 30, 23, 59, 59));
        strictEqual(config.academicYear, testYear);
      });
    });
    context('on July 1st', function () {
      it('should return the next calendar year as the academic year', function () {
        const testYear = 2035;
        clock.setSystemTime(new Date(testYear, MONTH.JUL, 1, 0, 0, 0));
        strictEqual(config.academicYear, (testYear + 1));
      });
    });
    context('between July 1st and December 31st', function () {
      it('should return the next calendar year as the academic year', function () {
        const testYear = 2040;
        clock.setSystemTime(new Date(testYear, MONTH.OCT, 12, 21, 13, 49));
        strictEqual(config.academicYear, (testYear + 1));
      });
    });
    context('on December 31st', function () {
      it('should return the next calendar year as the academic year', function () {
        const testYear = 2050;
        clock.setSystemTime(new Date(testYear, MONTH.DEC, 31, 23, 59, 59));
        strictEqual(config.academicYear, (testYear + 1));
      });
    });
  });
  describe('logLevel', function () {
    context('Valid Values', function () {
      Object.values(LOG_LEVEL).forEach((level: string) => {
        context(`When LOG_LEVEL is ${level}`, function () {
          it(`returns "${level}"`, function () {
            const config = new ConfigService({ LOG_LEVEL: level });
            strictEqual(config.logLevel, level);
          });
        });
      });
    });
    context('Invalid Values', function () {
      context('When LOG_LEVEL is not a valid log level', function () {
        it('Returns LOG_LEVEL.ERROR', function () {
          const config = new ConfigService({ LOG_LEVEL: 'foo' });
          strictEqual(config.logLevel, LOG_LEVEL.ERROR);
        });
      });
      context('When LOG_LEVEL is undefined', function () {
        it('Returns LOG_LEVEL.ERROR', function () {
          const config = new ConfigService({ });
          strictEqual(config.logLevel, LOG_LEVEL.ERROR);
        });
      });
    });
  });
});
