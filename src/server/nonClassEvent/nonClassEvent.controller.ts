import {
  Controller, Get, Inject, Query, UseGuards,
} from '@nestjs/common';
import { ConfigService } from 'server/config/config.service';
import { Authentication } from 'server/auth/authentication.guard';
import NonClassMeetingResponseDTO from 'common/dto/nonClassMeetings/NonClassMeeting.dto';
import { NonClassEventService } from './nonClassEvent.service';
import { NonClassParentView } from './NonClassParentView.entity';

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
  ): Promise<Record<string, NonClassMeetingResponseDTO[]>> {
    let academicYear: number;
    if (acyr) {
      academicYear = acyr;
    } else {
      ({ academicYear } = this.config);
    }

    const nonClassEvents = (await this.service.find(academicYear))
      .reduce(
        (
          acc: Record<string, NonClassParentView[]>,
          val: NonClassParentView
        ) => {
          const { calendarYear: year } = val.spring;

          if (!Array.isArray(acc[year])) {
            acc[year] = [];
          }
          acc[year].push(val);
          return acc;
        }, {}
      );
    return nonClassEvents;
  }
}
