import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { LogService } from './log.service';

/**
 * Simple middleware that applies the morgan middleware, injected with the
 * log module's httpStream. This will write all http logs from the app to
 * Winston's http stream.
 */

@Injectable()
class LogMiddleware implements NestMiddleware {
  private readonly log: LogService;

  public constructor(@Inject(LogService)logger: LogService) {
    this.log = logger;
  }

  /**
   * Call morgan middleware, writing all logs to the http stream
   */
  use(req: Request, res: Response, next: NextFunction): void {
    morgan(
      'combined',
      {
        stream: this.log.httpStream,
      }
    )(req, res, next);
  }
}

export { LogMiddleware };
