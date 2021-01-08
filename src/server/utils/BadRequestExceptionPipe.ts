import { ValidationPipe } from '@nestjs/common';

export class BadRequestExceptionPipe extends ValidationPipe {
  public constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }
}
