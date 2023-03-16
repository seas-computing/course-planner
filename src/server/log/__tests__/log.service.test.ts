import { strictEqual } from 'assert';
import util from 'util';
import {
  stub, SinonStub, spy, SinonSpy,
} from 'sinon';
import { ConfigService } from 'server/config/config.service';
import { LOG_LEVEL, TYPEORM_LOG_LEVEL } from 'common/constants';
import winston, { Logger } from 'winston';
import * as dummy from 'testData';
import { LogService, LABEL } from '../log.service';

describe('Log Service', function () {
  let logService: LogService;
  let winstonStub: Record<string, SinonStub>;
  const testClass = 'testClass';
  const testLabel = 'testLabel';
  const testQuery = 'testQuery';
  const testParameters = ['test', 'parameters'];
  let inspectSpy: SinonSpy;
  const mockInspect = (val: unknown): string => util.inspect(val, {
    depth: Infinity,
    colors: false,
    compact: false,
  });
  beforeEach(function () {
    winstonStub = {
      error: stub(),
      warn: stub(),
      info: stub(),
      http: stub(),
      verbose: stub(),
      debug: stub(),
    };
    stub(winston, 'createLogger')
      .returns(winstonStub as unknown as Logger);
    inspectSpy = spy(util, 'inspect');
    logService = new LogService(new ConfigService({
      LOG_LEVEL: LOG_LEVEL.DEBUG,
      NODE_ENV: 'testing',
    }));
  });
  describe('logFormat', function () {
    let formatted: string;
    let timestamp: string;
    beforeEach(function () {
      timestamp = new Date().toISOString();
      const testInfo = {
        level: LOG_LEVEL.INFO,
        message: dummy.string,
        timestamp,
        label: testLabel,
      };
      formatted = logService.logFormat(testInfo);
    });
    it('Should uppercase the log level', function () {
      strictEqual(
        new RegExp(LOG_LEVEL.INFO).test(formatted),
        false
      );
      strictEqual(
        new RegExp(LOG_LEVEL.INFO.toUpperCase()).test(formatted),
        true
      );
    });
  });
  describe('error', function () {
    context('logged without a label', function () {
      context('called with just an Error', function () {
        beforeEach(function () {
          logService.error(dummy.error);
        });
        it('Should log the message first', function () {
          strictEqual(winstonStub.error.args[0][0], dummy.error.message);
        });
        it('Should log the stack trace second', function () {
          strictEqual(winstonStub.error.callCount, 2);
          strictEqual(winstonStub.error.args[1][0], dummy.error.stack);
        });
      });
      context('Called with just a message', function () {
        beforeEach(function () {
          logService.error(dummy.string);
        });
        it('Should log the message', function () {
          strictEqual(winstonStub.error.callCount, 1);
          strictEqual(winstonStub.error.args[0][0], dummy.string);
        });
      });
      context('Called with a message and stack trace', function () {
        beforeEach(function () {
          logService.error(dummy.string, dummy.error.stack);
        });
        it('Should log the message', function () {
          strictEqual(winstonStub.error.args[0][0], dummy.string);
        });
        it('Should log the stack trace second', function () {
          strictEqual(winstonStub.error.args[1][0], dummy.error.stack);
          strictEqual(winstonStub.error.callCount, 2);
        });
        it('Should label both messages as being from NestJS', function () {
          strictEqual(winstonStub.error.args[0][1].label, LABEL.NEST);
          strictEqual(winstonStub.error.args[1][1].label, LABEL.NEST);
        });
      });
    });
    context('logged with a label', function () {
      context('called with an Error', function () {
        beforeEach(function () {
          logService.error(dummy.error, null, testLabel);
        });
        it('Should log the message with the label first', function () {
          strictEqual(winstonStub.error.args[0][0], dummy.error.message);
          strictEqual(winstonStub.error.args[0][1].label, testLabel);
        });
        it('Should log the stack trace with the label second', function () {
          strictEqual(winstonStub.error.callCount, 2);
          strictEqual(winstonStub.error.args[1][0], dummy.error.stack);
          strictEqual(winstonStub.error.args[1][1].label, testLabel);
        });
      });
      context('Called with a message', function () {
        beforeEach(function () {
          logService.error(dummy.string, null, testLabel);
        });
        it('Should log the message with the label', function () {
          strictEqual(winstonStub.error.callCount, 1);
          strictEqual(winstonStub.error.args[0][0], dummy.string);
          strictEqual(winstonStub.error.args[0][1].label, testLabel);
        });
      });
      context('Called with a message, stack trace, and label', function () {
        beforeEach(function () {
          logService.error(dummy.string, dummy.error.stack, testLabel);
        });
        it('Should log the message with the label first', function () {
          strictEqual(winstonStub.error.args[0][0], dummy.string);
          strictEqual(winstonStub.error.args[0][1].label, testLabel);
        });
        it('Should log the stack trace with the label second', function () {
          strictEqual(winstonStub.error.callCount, 2);
          strictEqual(winstonStub.error.args[1][0], dummy.error.stack);
          strictEqual(winstonStub.error.args[1][1].label, testLabel);
        });
      });
    });
  });
  describe('logQueryError', function () {
    context('Called without parameters', function () {
      beforeEach(function () {
        logService.logQueryError(dummy.error.message, testQuery);
      });
      it('Should log the error message first, labeled with "TypeORM"', function () {
        strictEqual(winstonStub.error.args[0][0], dummy.error.message);
        strictEqual(winstonStub.error.args[0][1].label, LABEL.TYPEORM);
      });
      it('Should log the query second, labeled with "TypeORM"', function () {
        strictEqual(winstonStub.error.callCount, 2);
        strictEqual(winstonStub.error.args[1][0], testQuery);
        strictEqual(winstonStub.error.args[1][1].label, LABEL.TYPEORM);
      });
    });
    context('Called with parameters', function () {
      beforeEach(function () {
        logService.logQueryError(
          dummy.error.message,
          testQuery,
          testParameters
        );
      });
      it('Should log the error message first, labeled with "TypeORM"', function () {
        strictEqual(winstonStub.error.args[0][0], dummy.error.message);
        strictEqual(winstonStub.error.args[0][1].label, LABEL.TYPEORM);
      });
      it('Should log the query second, labeled with "TypeORM"', function () {
        strictEqual(winstonStub.error.args[1][0], testQuery);
        strictEqual(winstonStub.error.args[1][1].label, LABEL.TYPEORM);
      });
      it('Should log the parameters third, labeled with "TypeORM"', function () {
        strictEqual(winstonStub.error.callCount, 3);
        strictEqual(winstonStub.error.args[2][0], mockInspect(testParameters));
        strictEqual(winstonStub.error.args[2][1].label, LABEL.TYPEORM);
      });
    });
  });
  describe('warn', function () {
    context('logged without a label', function () {
      beforeEach(function () {
        logService.warn(dummy.string);
      });
      it('Should log the message', function () {
        strictEqual(winstonStub.warn.callCount, 1);
        strictEqual(winstonStub.warn.args[0][0], dummy.string);
      });
      it('Should leave the label undefined', function () {
        strictEqual(winstonStub.warn.args[0][1].label, undefined);
      });
    });
    context('logged with a label', function () {
      beforeEach(function () {
        logService.warn(dummy.string, testLabel);
      });
      it('Should log the message', function () {
        strictEqual(winstonStub.warn.callCount, 1);
        strictEqual(winstonStub.warn.args[0][0], dummy.string);
      });
      it('Should include the label', function () {
        strictEqual(winstonStub.warn.args[0][1].label, testLabel);
      });
    });
  });
  describe('logQuerySlow', function () {
    beforeEach(function () {
      logService.logQuerySlow(5000, testQuery);
    });
    it('Should log how long the query took', function () {
      strictEqual(
        winstonStub.warn.args[0][0],
        'The following query took 5000ms to run'
      );
    });
    it('Should log the query itself', function () {
      strictEqual(winstonStub.warn.callCount, 2);
      strictEqual(winstonStub.warn.args[1][0], testQuery);
    });
  });
  describe('info', function () {
    context('logged without a label', function () {
      beforeEach(function () {
        logService.info(dummy.string);
      });
      it('Should log the message', function () {
        strictEqual(winstonStub.info.callCount, 1);
        strictEqual(winstonStub.info.args[0][0], dummy.string);
      });
      it('Should leave the label undefined', function () {
        strictEqual(winstonStub.info.args[0][1].label, undefined);
      });
    });
    context('logged with a label', function () {
      beforeEach(function () {
        logService.info(dummy.string, testLabel);
      });
      it('Should log the message', function () {
        strictEqual(winstonStub.info.callCount, 1);
        strictEqual(winstonStub.info.args[0][0], dummy.string);
      });
      it('Should include the label', function () {
        strictEqual(winstonStub.info.args[0][1].label, testLabel);
      });
    });
  });
  describe('log', function () {
    context('Called with a message and a Nest Class', function () {
      beforeEach(function () {
        logService.log(dummy.string, testClass);
      });
      it('Should log the message to the info stream and label it as NestJS#class', function () {
        strictEqual(winstonStub.info.callCount, 1);
        strictEqual(winstonStub.info.args[0][0], dummy.string);
        strictEqual(
          winstonStub.info.args[0][1].label,
          `${LABEL.NEST}#${testClass}`
        );
      });
    });
    context('Called with a TYPEORM_LOG_LEVEL and a message', function () {
      context('With a first argument of TYPEORM_LOG_LEVEL.LOG', function () {
        beforeEach(function () {
          logService.log(TYPEORM_LOG_LEVEL.LOG, dummy.string);
        });
        it('Should log the message to the info stream and label it as TypeORM', function () {
          strictEqual(winstonStub.info.callCount, 1);
          strictEqual(winstonStub.info.args[0][0], dummy.string);
          strictEqual(winstonStub.info.args[0][1].label, LABEL.TYPEORM);
        });
      });
      context('With a first argument of TYPEORM_LOG_LEVEL.INFO', function () {
        beforeEach(function () {
          logService.log(TYPEORM_LOG_LEVEL.INFO, dummy.string);
        });
        it('Should log the message to the info stream and label it as TypeORM', function () {
          strictEqual(winstonStub.info.callCount, 1);
          strictEqual(winstonStub.info.args[0][0], dummy.string);
          strictEqual(winstonStub.info.args[0][1].label, LABEL.TYPEORM);
        });
      });
      context('With a first argument of TYPEORM_LOG_LEVEL.WARN', function () {
        beforeEach(function () {
          logService.log(TYPEORM_LOG_LEVEL.WARN, dummy.string);
        });
        it('Should log the message to the warn stream and label it as TypeORM', function () {
          strictEqual(winstonStub.warn.callCount, 1);
          strictEqual(winstonStub.warn.args[0][0], dummy.string);
          strictEqual(winstonStub.warn.args[0][1].label, LABEL.TYPEORM);
        });
      });
    });
  });
  describe('http', function () {
    context('logged without a label', function () {
      beforeEach(function () {
        logService.http(dummy.string);
      });
      it('Should log the message', function () {
        strictEqual(winstonStub.http.callCount, 1);
        strictEqual(winstonStub.http.args[0][0], dummy.string);
      });
      it('Should leave the label undefined', function () {
        strictEqual(winstonStub.http.args[0][1].label, undefined);
      });
    });
    context('logged with a label', function () {
      beforeEach(function () {
        logService.http(dummy.string, testLabel);
      });
      it('Should log the message', function () {
        strictEqual(winstonStub.http.callCount, 1);
        strictEqual(winstonStub.http.args[0][0], dummy.string);
      });
      it('Should include the label', function () {
        strictEqual(winstonStub.http.args[0][1].label, testLabel);
      });
    });
  });
  describe('httpStream', function () {
    it('should expose an object with a write function that logs to the http stream, labeled as Express', function () {
      logService.httpStream.write(dummy.string);
      strictEqual(winstonStub.http.callCount, 1);
      strictEqual(winstonStub.http.args[0][0], dummy.string);
      strictEqual(winstonStub.http.args[0][1].label, LABEL.EXPRESS);
    });
  });
  describe('verbose', function () {
    context('Called without a label', function () {
      context('Called with a string', function () {
        beforeEach(function () {
          logService.verbose(dummy.string);
        });
        it('Should log the string to the verbose stream', function () {
          strictEqual(winstonStub.verbose.callCount, 1);
          strictEqual(winstonStub.verbose.args[0][0], dummy.string);
        });
        it('Should leave the label undefined', function () {
          strictEqual(winstonStub.verbose.args[0][1].label, undefined);
        });
      });
      context('Called with a number', function () {
        beforeEach(function () {
          logService.verbose(dummy.int);
        });
        it('Should log the stringified value to the verbose stream', function () {
          strictEqual(winstonStub.verbose.callCount, 1);
          strictEqual(winstonStub.verbose.args[0][0], dummy.int.toString());
        });
        it('Should leave the label undefined', function () {
          strictEqual(winstonStub.verbose.args[0][1].label, undefined);
        });
      });
      context('Called with an object-like value', function () {
        beforeEach(function () {
          logService.verbose(dummy.regularUser);
        });
        it('Should pass the value to util.inspect', function () {
          strictEqual(inspectSpy.callCount, 1);
          strictEqual(inspectSpy.args[0][0], dummy.regularUser);
        });
        it('Should log to the verbose stream', function () {
          strictEqual(winstonStub.verbose.callCount, 1);
          strictEqual(
            winstonStub.verbose.args[0][0],
            mockInspect(dummy.regularUser)
          );
        });
        it('Should leave the label undefined', function () {
          strictEqual(winstonStub.verbose.args[0][1].label, undefined);
        });
      });
    });
    context('Logged with a label', function () {
      context('Called with a string', function () {
        beforeEach(function () {
          logService.verbose(dummy.string, testLabel);
        });
        it('Should log the string to the verbose stream', function () {
          strictEqual(winstonStub.verbose.callCount, 1);
          strictEqual(winstonStub.verbose.args[0][0], dummy.string);
        });
        it('Should pass through the label', function () {
          strictEqual(winstonStub.verbose.args[0][1].label, testLabel);
        });
      });
      context('Called with a number', function () {
        beforeEach(function () {
          logService.verbose(dummy.int, testLabel);
        });
        it('Should log the stringified value to the verbose stream', function () {
          strictEqual(winstonStub.verbose.callCount, 1);
          strictEqual(winstonStub.verbose.args[0][0], dummy.int.toString());
        });
        it('Should pass through the label', function () {
          strictEqual(winstonStub.verbose.args[0][1].label, testLabel);
        });
      });
      context('Called with an object-like value', function () {
        beforeEach(function () {
          logService.verbose(dummy.regularUser, testLabel);
        });
        it('Should pass the value to util.inspect', function () {
          strictEqual(inspectSpy.callCount, 1);
          strictEqual(inspectSpy.args[0][0], dummy.regularUser);
        });
        it('Should log to the verbose stream', function () {
          strictEqual(winstonStub.verbose.callCount, 1);
          strictEqual(
            winstonStub.verbose.args[0][0],
            mockInspect(dummy.regularUser)
          );
        });
        it('Should pass through the label', function () {
          strictEqual(winstonStub.verbose.args[0][1].label, testLabel);
        });
      });
    });
  });
  describe('debug', function () {
    context('Called without a label', function () {
      context('Called with a string', function () {
        beforeEach(function () {
          logService.debug(dummy.string);
        });
        it('Should log the string to the debug stream', function () {
          strictEqual(winstonStub.debug.callCount, 1);
          strictEqual(winstonStub.debug.args[0][0], dummy.string);
        });
        it('Should leave the label undefined', function () {
          strictEqual(winstonStub.debug.args[0][1].label, undefined);
        });
      });
      context('Called with a number', function () {
        beforeEach(function () {
          logService.debug(dummy.int);
        });
        it('Should log the stringified value to the debug stream', function () {
          strictEqual(winstonStub.debug.callCount, 1);
          strictEqual(winstonStub.debug.args[0][0], dummy.int.toString());
        });
        it('Should leave the label undefined', function () {
          strictEqual(winstonStub.debug.args[0][1].label, undefined);
        });
      });
      context('Called with an object-like value', function () {
        beforeEach(function () {
          logService.debug(dummy.regularUser);
        });
        it('Should pass the value to util.inspect', function () {
          strictEqual(inspectSpy.callCount, 1);
          strictEqual(inspectSpy.args[0][0], dummy.regularUser);
        });
        it('Should log to the debug stream', function () {
          strictEqual(winstonStub.debug.callCount, 1);
          strictEqual(
            winstonStub.debug.args[0][0],
            mockInspect(dummy.regularUser)
          );
        });
        it('Should leave the label undefined', function () {
          strictEqual(winstonStub.debug.args[0][1].label, undefined);
        });
      });
    });
    context('Logged with a label', function () {
      context('Called with a string', function () {
        beforeEach(function () {
          logService.debug(dummy.string, testLabel);
        });
        it('Should log the string to the debug stream', function () {
          strictEqual(winstonStub.debug.callCount, 1);
          strictEqual(winstonStub.debug.args[0][0], dummy.string);
        });
        it('Should pass through the label', function () {
          strictEqual(winstonStub.debug.args[0][1].label, testLabel);
        });
      });
      context('Called with a number', function () {
        beforeEach(function () {
          logService.debug(dummy.int, testLabel);
        });
        it('Should log the stringified value to the debug stream', function () {
          strictEqual(winstonStub.debug.callCount, 1);
          strictEqual(winstonStub.debug.args[0][0], dummy.int.toString());
        });
        it('Should pass through the label', function () {
          strictEqual(winstonStub.debug.args[0][1].label, testLabel);
        });
      });
      context('Called with an object-like value', function () {
        beforeEach(function () {
          logService.debug(dummy.regularUser, testLabel);
        });
        it('Should pass the value to util.inspect', function () {
          strictEqual(inspectSpy.callCount, 1);
          strictEqual(inspectSpy.args[0][0], dummy.regularUser);
        });
        it('Should log to the debug stream', function () {
          strictEqual(winstonStub.debug.callCount, 1);
          strictEqual(
            winstonStub.debug.args[0][0],
            mockInspect(dummy.regularUser)
          );
        });
        it('Should pass through the label', function () {
          strictEqual(winstonStub.debug.args[0][1].label, testLabel);
        });
      });
    });
  });
  describe('logQuery', function () {
    context('Called without parameters', function () {
      beforeEach(function () {
        logService.logQuery(testQuery);
      });
      it('Should log a notification to the verbose stream', function () {
        strictEqual(winstonStub.verbose.callCount, 1);
        strictEqual(winstonStub.verbose.args[0][0], 'Running query against database');
      });
      it('Should label the verbose notification with "TypeORM"', function () {
        strictEqual(winstonStub.verbose.args[0][1].label, LABEL.TYPEORM);
      });
      it('Should log the full query to the debug stream', function () {
        strictEqual(winstonStub.debug.callCount, 1);
        strictEqual(winstonStub.debug.args[0][0], testQuery);
      });
      it('Should label the verbose notification with "TypeORM"', function () {
        strictEqual(winstonStub.debug.args[0][1].label, LABEL.TYPEORM);
      });
    });
    context('Called with parameters', function () {
      beforeEach(function () {
        logService.logQuery(testQuery, testParameters);
      });
      it('Should log a notification to the verbose stream', function () {
        strictEqual(winstonStub.verbose.callCount, 1);
        strictEqual(winstonStub.verbose.args[0][0], 'Running query against database');
      });
      it('Should label the verbose notification with "TypeORM"', function () {
        strictEqual(winstonStub.verbose.args[0][1].label, LABEL.TYPEORM);
      });
      it('Should log the full query to the debug stream', function () {
        strictEqual(winstonStub.debug.args[0][0], testQuery);
      });
      it('Should label the debug query with "TypeORM"', function () {
        strictEqual(winstonStub.debug.args[0][1].label, LABEL.TYPEORM);
      });
      it('Should pass the parameters to util.inspect', function () {
        strictEqual(inspectSpy.callCount, 1);
        strictEqual(inspectSpy.args[0][0], testParameters);
      });
      it('should log the parameters to the debug stream', function () {
        strictEqual(winstonStub.debug.args[1][0], mockInspect(testParameters));
      });
      it('Should label the verbose notification with "TypeORM"', function () {
        strictEqual(winstonStub.debug.args[1][1].label, LABEL.TYPEORM);
      });
    });
  });
  describe('logMigration', function () {
    beforeEach(function () {
      logService.logMigration(dummy.string);
    });
    it('Should log a notification to the verbose stream', function () {
      strictEqual(winstonStub.verbose.callCount, 1);
      strictEqual(winstonStub.verbose.args[0][0], 'Running migration process');
    });
    it('Should label the verbose notification with "TypeORM"', function () {
      strictEqual(winstonStub.verbose.args[0][1].label, LABEL.TYPEORM);
    });
    it('Should log the migration message to the debug stream', function () {
      strictEqual(winstonStub.debug.callCount, 1);
      strictEqual(winstonStub.debug.args[0][0], dummy.string);
    });
    it('Should label the verbose notification with "TypeORM"', function () {
      strictEqual(winstonStub.debug.args[0][1].label, LABEL.TYPEORM);
    });
  });
  describe('logSchemaBuild', function () {
    beforeEach(function () {
      logService.logSchemaBuild(dummy.string);
    });
    it('Should log a notification to the verbose stream', function () {
      strictEqual(winstonStub.verbose.callCount, 1);
      strictEqual(winstonStub.verbose.args[0][0], 'Running schema build process');
    });
    it('Should label the verbose notification with "TypeORM"', function () {
      strictEqual(winstonStub.verbose.args[0][1].label, LABEL.TYPEORM);
    });
    it('Should log the migration message to the debug stream', function () {
      strictEqual(winstonStub.debug.callCount, 1);
      strictEqual(winstonStub.debug.args[0][0], dummy.string);
    });
    it('Should label the verbose notification with "TypeORM"', function () {
      strictEqual(winstonStub.debug.args[0][1].label, LABEL.TYPEORM);
    });
  });
});
