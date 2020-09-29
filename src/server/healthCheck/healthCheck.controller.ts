import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('Health Check')
@Controller('api/health-check')
export class HealthCheckController {
  /**
   * Provide an open endpoint to show that the server is still online
   */
  @Get('/')
  @ApiOperation({
    title: 'While the server is active, return a 200 status code',
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
