import {
  Injectable, Inject, Logger, Global,
} from '@nestjs/common';
import winston, { Logger as WinstonLogger } from 'winston';
import { ConfigService } from 'server/config/config.service';
import { StreamOptions } from 'morgan';
import { inspect, InspectOptions } from 'util';

/**
 * Represents a value that can be directly written to the logs, without needing
 * to go through util.inspect
 */
type Writable = string | number;

/**
 *  Represents more complex objects that should be passed through util.inspect
 *  before they can be meaningfully written to the console.
 */
export type Inspectable = Record<string, unknown>
| Record<string, unknown>[]
| Writable[]
| unknown[];

/**
 * A general type for any data that can be logged by the logger
 */

export type Loggable<T> = T extends Writable
  ? Writable
  : T extends Record<Writable, unknown>
    ? Inspectable
    : unknown;

/**
 * An injectable service that instantiates a Winston logger, and overwrites the
 * existing Nest logging methods with Winston's methods.
 *
 */

@Global()
@Injectable()
class LogService extends Logger {
  /**
   * The winston instance that will be used inside the service
   */
  private readonly logger: WinstonLogger;

  /**
   * The options passed to util.inspect to display object values
   */
  private readonly inspectOptions: InspectOptions;

  public constructor(
  @Inject(ConfigService) config: ConfigService
  ) {
    super();
    this.logger = winston.createLogger({
      level: config.get('LOG_LEVEL') || 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        // Define a custom log format
        winston.format.printf((info) => {
          const fmtLevel = `[${info.level.toUpperCase()}]`.padStart(10);
          return `${info.timestamp as string} ${fmtLevel}  ${
            info.label ? `(${info.label as string}) ` : ''
          }${info.message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
      ],
    });
    this.inspectOptions = {
      depth: Infinity,
      colors: config.isDevelopment,
      compact: false,
    };
  }

  /**
   * Helper function that wraps util.inspect and passes in our defined options
   */
  private inspect<T>(obj: Loggable<T>): string {
    return inspect(obj, this.inspectOptions);
  }

  /**
   * The base logging level for Nest.
   * In our implementaiton, this will be handled by winston.info
   */
  public log(message: string): void {
    this.info(message);
  }

  /**
   * Log information about errors thrown in the application.
   * LOG LEVEL: 0
   */
  public error(message: string, trace: string): void{
    this.logger.error(message);
    this.logger.error('====  STACK TRACE  ====');
    this.logger.error(trace);
  }

  /**
   * Record issues that don't degrade the application, but may produce
   * less-desirable results.
   * LOG LEVEL: 1
   */
  public warn(message: string):void {
    this.logger.warn(message);
  }

  /**
   * The standard log level, used to for relaying regular information about the
   * status of the app, e.g. Nest startup messages
   * LOG LEVEL: 2
   */
  public info(message: string):void {
    this.logger.info(message);
  }

  /**
   * Records all requests/responses handled by the application, similar to
   * Apache/nginx logs
   * LOG LEVEL: 3
   */
  public http(message: string):void {
    this.logger.http(message);
  }

  /**
   * Exposes a writable stream for http messages that can be used by morgan for
   * generating apache-style logs.
   */
  public get httpStream(): StreamOptions {
    return {
      write: (message: string): void => {
        this.http(message);
      },
    };
  }

  /**
   * Records more detailed information about the running application. Includes:
   *  - ID of user's associated with requests
   *  - Notifications about data read from and written to the database
   *  - Body content of POST/PUT requests
   *  - Body content returned in responses
   * LOG LEVEL: 4
   */
  public verbose(message: string): void {
    this.logger.verbose(message);
  }

  /**
   * Provides more granual data about the execution flow of the app. Only intended for use in development
   * LOG LEVEL: 5
   */
  public debug(message: string):void {
    this.logger.debug(message);
  }

  /**
   * An unnecessary level of logging detail
   * LOG LEVEL: 6
   */
  public silly(message: string):void {
    this.logger.silly(message);
  }
}

export { LogService };
