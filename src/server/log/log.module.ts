import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogService } from './log.service';
import { LogInterceptor } from './log.interceptor';

@Global()
@Module({
  providers: [
    LogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
  ],
  exports: [
    LogService,
  ],
})
class LogModule { }

export { LogModule };
