import {
  Injectable, Inject, Logger, Global,
} from '@nestjs/common';
import winston, { Logger as WinstonLogger } from 'winston';
import { ConfigService } from 'server/config/config.service';

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

  public constructor(
  @Inject(ConfigService) config: ConfigService
  ) {
    super();
    this.logger = winston.createLogger({
      level: config.logLevel,
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console(),
      ],
    });
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
