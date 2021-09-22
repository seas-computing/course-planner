import { DAY } from 'common/constants';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID, IsNotEmpty, IsEnum, IsOptional, Matches,
} from 'class-validator';
import { IsOccurringBefore, IsOccurringAfter } from '../utils';
import { PGTime } from '../../utils/PGTime';

/**
 * Represents a request sent to the server to create or edit a meeting
 * associated with a course instance or non class event
 */

export abstract class MeetingRequestDTO {
  /**
   * If this is an existing meeting being edited, this will be the UUID in our
   * database.
   */
  @ApiProperty({
    type: 'string',
    example: '7187d276-f6cf-4323-af7d-dd70f4a08e3d',
  })
  @IsUUID()
  @IsOptional()
  public id?: string;

  /**
   * The day of the week on which the meeting takes place.
   */
  @ApiProperty({
    type: 'string',
    example: DAY.MON,
  })
  @IsNotEmpty()
  @IsEnum(DAY)
  public day: DAY;

  /**
   * The time at which the meeting starts
   */
  @ApiProperty({
    type: 'string',
    example: '12:00:00',
  })
  @IsNotEmpty()
  @Matches(PGTime.strictRegex)
  @IsOccurringBefore('endTime')
  public startTime: string;

  /**
   * The time at which the meeting ends
   */
  @ApiProperty({
    type: 'string',
    example: '13:30:00',
  })
  @IsNotEmpty()
  @Matches(PGTime.strictRegex)
  @IsOccurringAfter('startTime')
  public endTime: string;

  /**
   * The ID of the room where the meeting will be held, which can be undefined
   * if one hasn't been chosen yet.
   */
  @ApiProperty({
    type: 'string',
    example: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
  })
  @IsUUID()
  @IsOptional()
  public roomId?: string;
}
