import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
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
    return { status: 'OK' };
  }
}
