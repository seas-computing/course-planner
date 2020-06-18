import {
  Controller, Get, Inject, Query,
} from '@nestjs/common';
import NonClassMeetingResponseDTO from 'common/dto/nonclassmeetings/NonClassMeeting.dto';
import { NonClassEventService } from './nonClassEvent.service';


@Controller('api/non-class-events')
export class NonClassEventController {
  @Inject(NonClassEventService)
  private service: NonClassEventService;

  @Get('')
  public async find(
    @Query('acyr') acyr: number
  ): Promise<NonClassMeetingResponseDTO[]> {
    return this.service.find(acyr);
  }
}
