import { ValidationPipe, BadRequestException } from '@nestjs/common';

export class BadRequestExceptionPipe extends ValidationPipe {
  public constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    });
  }
}
