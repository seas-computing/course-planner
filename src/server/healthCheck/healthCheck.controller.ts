import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '../config/config.service';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  /**
   * Provide an open endpoint to show that the server is still online
   */
  @Get('/')
  @ApiOperation({
    summary: 'While the server is active, return a 200 status code',
  })
  @ApiOkResponse({
    type: 'json',
    description: 'A 200 response',
    isArray: false,
  })
  public getHealthCheck(
  ): Record<string, string> {
    return {
      status: 'OK',
      version: this.config.buildVersion,
    };
  }
}
