import {
  Controller, Get, Inject, Query,
} from '@nestjs/common';
import NonClassMeetingResponseDTO from 'common/dto/nonclassmeetings/NonClassMeeting.dto';
import { ConfigService } from 'server/config/config.service';
import { NonClassEventService } from './nonClassEvent.service';


@Controller('api/non-class-events')
export class NonClassEventController {
  @Inject(ConfigService)
  private config: ConfigService;

  @Inject(NonClassEventService)
  private service: NonClassEventService;

  @Get('')
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
