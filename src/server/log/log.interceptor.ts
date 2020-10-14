import {
  Injectable,
  Inject,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { HealthCheckController } from 'server/healthCheck/healthCheck.controller';
import { User } from 'common/classes';
import { LogService, Inspectable } from './log.service';

@Injectable()
class LogInterceptor<T extends Inspectable> implements NestInterceptor<T> {
  @Inject(LogService)
  private readonly log: LogService;

  /**
   * Logs metadata about every incoming request and outgoing response.
   * This interceptor will be applied globally in the [[LogModule]], so you
   * should not need to manually include it anywhere.
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<T> {
    const controller = context.getClass();
    //
    // Ignore logging the healthcheck controller
    if (controller.name === HealthCheckController.name) {
      return next.handle() as Observable<T>;
    }
    const handler = context.getHandler();

    // Save a reference to the controller#method for logging
    const logLabel = `${controller.name}#${handler.name}`;
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();

    // Log details about the user
    if (req.session?.user) {
      const userData = new User(req.session.user);
      this.log.verbose(userData, logLabel);
    } else {
      this.log.verbose('Request made by anonymous user', logLabel);
    }

    // Log whether there's any payload associated with the request
    if (req.method !== 'GET') {
      if (Object.keys(req.body).length > 0) {
        this.log.verbose('Request includes data', logLabel);
        this.log.debug(req.body as Inspectable, logLabel);
      } else {
        this.log.verbose('Request does not include any data', logLabel);
      }
    }

    // Log any data sent back with the response
    return next
      .handle()
      .pipe(
        tap((data: T) => {
          this.log.verbose(`Response includes data containing ${
            Array.isArray(data)
              ? `${data.length} item${data.length > 1 ? 's' : ''}`
              : '1 item'}`, logLabel);
          this.log.debug(data, logLabel);
        })
      );
  }
}

export { LogInterceptor };
