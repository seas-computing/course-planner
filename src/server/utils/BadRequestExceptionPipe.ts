import { ValidationPipe, BadRequestException } from '@nestjs/common';

export class BadRequestExceptionPipe extends ValidationPipe {
  public constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory:
        (errors): BadRequestException => new BadRequestException(
          errors.map(({ constraints }): string[] => Object
            .entries(constraints)
            .map(([, value]): string => value)).join()
        ),
    });
  }
}
