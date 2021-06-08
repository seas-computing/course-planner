import { DAY, TERM } from 'common/constants';
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, Matches } from 'class-validator';
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
  @ApiModelProperty({
    type: 'string',
    example: '2019',
  })
  @IsNotEmpty()
  public calendarYear: string;

  /**
   * The term in which the meeting takes place.
   */
  @ApiModelProperty({
    type: 'string',
    example: TERM.SPRING,
  })
  @IsNotEmpty()
  @IsEnum(TERM)
  public term: TERM;

  /**
   * The day of the week on which the meeting takes place.
   */
  @ApiModelProperty({
    type: 'string',
    example: DAY.WED,
  })
  @IsNotEmpty()
  @IsEnum(DAY)
  public day: DAY;

  /**
   * The time at which the meeting starts
   */
  @ApiModelProperty({
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
  @ApiModelProperty({
    type: 'string',
    example: '16:30:00',
  })
  @IsNotEmpty()
  @Matches(PGTime.regex)
  @IsOccurringAfter('startTime')
  public endTime: string;
}
