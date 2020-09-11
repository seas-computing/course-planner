import {
  Controller, Get, Inject, Query, UseGuards,
} from '@nestjs/common';
import NonClassMeetingResponseDTO from 'common/dto/nonClassMeetings/NonClassMeeting.dto';
import { ConfigService } from 'server/config/config.service';
import { Authentication } from 'server/auth/authentication.guard';
import { NonClassEventService } from './nonClassEvent.service';

@UseGuards(Authentication)
@Controller('api/non-class-events')
export class NonClassEventController {
  @Inject(ConfigService)
  private config: ConfigService;

  @Inject(NonClassEventService)
  private service: NonClassEventService;

  /**
   * Retrieves all non class meetings for the specified (or current) academic year.
   *
   * @param acyr The academic year to query by. Defaults to the current academic year if not specified
   */
  @Get('/')
  public async find(
    @Query('acyr') acyr?: number
  ): Promise<NonClassMeetingResponseDTO[]> {
    let academicYear: number;
    if (acyr) {
      academicYear = acyr;
    } else {
      ({ academicYear } = this.config);
    }

    return this.service.find(academicYear);
  }
}
