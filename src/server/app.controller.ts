import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { AppService } from './app.service';

/**
 * Basic application controller that integrates the appService
 */

@Controller()
@UseGuards(AuthGuard)
export class AppController {
  private readonly appService: AppService;

  public constructor(appService: AppService) {
    this.appService = appService;
  }

  @Get()
  public getHello(): string {
    return this.appService.getHello();
  }
}
