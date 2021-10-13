import {
  BadRequestException,
  Body,
  Controller, Get, Inject, Post, Query, UseGuards,
} from '@nestjs/common';
import { ConfigService } from 'server/config/config.service';
import { Authentication } from 'server/auth/authentication.guard';
import NonClassMeetingResponseDTO from 'common/dto/nonClassMeetings/NonClassMeeting.dto';
import CreateNonClassParentDTO from 'common/dto/nonClassMeetings/CreateNonClassParent.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from 'server/area/area.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { NonClassParentResponse } from 'common/dto/nonClassMeetings/NonClassParentResponse.dto';
import { NonClassParentView } from './NonClassParentView.entity';
import { NonClassEventService } from './nonClassEvent.service';
import { NonClassParent } from './nonclassparent.entity';

@ApiTags('Non-Class Events')
@UseGuards(Authentication, new RequireGroup(GROUP.NON_CLASS))
@Controller('api/non-class-events')
@ApiForbiddenResponse({ description: 'The user is not authenticated' })
@ApiUnauthorizedResponse({
  description: 'The user is authenticated, but lacks the permissions to access this endpoint',
})
export class NonClassEventController {
  @Inject(ConfigService)
  private config: ConfigService;

  @Inject(NonClassEventService)
  private service: NonClassEventService;

  @InjectRepository(Area)
  private areaRepository: Repository<Area>;

  @InjectRepository(NonClassParent)
  private parentRepository: Repository<NonClassParent>;

  /**
   * Retrieves all non class meetings for the specified (or current) academic year.
   *
   * @param acyr The academic year to query by. Defaults to the current academic year if not specified
   */
  @Get('/')
  @ApiOperation({ summary: 'Retrieve all non-class events in the database' })
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

  @Post('/')
  @ApiOperation({
    summary: 'Create a new non-class parent',
    description: 'Creates a new non-class parent and populates all related non-class events (one assocaited with each semester in the database)',
  })
  @ApiCreatedResponse({
    type: NonClassParentResponse,
    description: 'The non-class parent was created along with one non-class event for each semester in the database',
  })
  @ApiBody({
    type: CreateNonClassParentDTO,
    required: true,
  })
  public async create(@Body() { area, ...parent }: CreateNonClassParentDTO):
  Promise<NonClassParentResponse> {
    try {
      const dbArea = await this.areaRepository.findOneOrFail(area);
      const { id } = await this.service.createWithNonClassEvents({
        ...parent,
        area: dbArea,
      });
      return this.parentRepository.findOne(id);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new BadRequestException(`Cannot create new non-class parent for invalid area: ${area}`);
      }
      throw e;
    }
  }
}
