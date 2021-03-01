import { DAY } from 'common/constants';
import { ApiModelProperty } from '@nestjs/swagger';

/**
 * Models the information a room included with the server response
 */

abstract class MeetingRoomResponse {
  /**
   * The database uuid of the room
   */
  @ApiModelProperty({
    type: 'string',
    example: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
  })
  public id: string;

  /**
   * The campus within the university where the room is located
   */
  @ApiModelProperty({
    type: 'string',
    example: 'Cambridge',
  })
  public campus: string;

  /**
   * The name of the building concatenated with the number of the room
   */
  @ApiModelProperty({
    type: 'string',
    example: 'Maxwell-Dworkin G125',
  })
  public name: string;
}

/**
 * Represents the reponse returned from the server after creating or editing a
 * meeting
 */

export default abstract class MeetingResponse {
  /**
   * The database UUID of the meeting
   */
  @ApiModelProperty({
    type: 'string',
    example: '7187d276-f6cf-4323-af7d-dd70f4a08e3d',
  })
  public id: string;

  /**
   * The day of the week on which the meeting takes place.
   */
  @ApiModelProperty({
    type: 'string',
    example: DAY.MON,
  })
  public day: DAY;

  /**
   * The time at which the meeting starts
   */
  @ApiModelProperty({
    type: 'string',
    example: '12:00:00-5',
  })
  public startTime: string;

  /**
   * The time at which the meeting ends
   */
  @ApiModelProperty({
    type: 'string',
    example: '13:30:00-5',
  })
  public endTime: string;

  /**
   * Defines a new room that should be created in database where the meeting
   * will be held.  Either this or [[MeetingRoomRequest]] must be defined
   */
  @ApiModelProperty({
    type: MeetingRoomResponse,
  })
  public room?: MeetingRoomResponse;
}
