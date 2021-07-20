import { DAY, TERM } from 'common/constants';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsEnum, Matches, IsOptional, IsUUID,
} from 'class-validator';
import { IsOccurringBefore, IsOccurringAfter } from '../utils';
import { PGTime } from '../../utils/PGTime';

/**
 * Represents a request to retrieve all rooms along with the course instance
 * and non class events that are occurring during the time requested
 */
export default abstract class RoomRequest {
  /**
   * The calendar year in which the meeting takes place
   */
  @ApiProperty({
    type: 'string',
    example: '2019',
  })
  @IsNotEmpty()
  public calendarYear: string;

  /**
   * The term in which the meeting takes place.
   */
  @ApiProperty({
    type: 'string',
    example: TERM.SPRING,
  })
  @IsNotEmpty()
  @IsEnum(TERM)
  public term: TERM;

  /**
   * The day of the week on which the meeting takes place.
   */
  @ApiProperty({
    type: 'string',
    example: DAY.WED,
  })
  @IsNotEmpty()
  @IsEnum(DAY)
  public day: DAY;

  /**
   * The time at which the meeting starts
   */
  @ApiProperty({
    type: 'string',
    example: '14:45:00',
  })
  @IsNotEmpty()
  @Matches(PGTime.regex)
  @IsOccurringBefore('endTime')
  public startTime: string;

  /**
   * The time at which the meeting ends
   */
  @ApiProperty({
    type: 'string',
    example: '16:30:00',
  })
  @IsNotEmpty()
  @Matches(PGTime.regex)
  @IsOccurringAfter('startTime')
  public endTime: string;

  /**
   * The id of a meeting parent to exclude from the meetingTitles field in the
   * response
   */
  @ApiProperty({
    type: 'string',
    example: 'daa3ea86-f2ee-4730-aae6-a21736c1af6c',
  })
  @IsOptional()
  @IsUUID()
  public excludeParent?: string;
}
