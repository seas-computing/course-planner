import { DAY } from 'common/constants';
import { ApiModelProperty } from '@nestjs/swagger';
import {
  IsUUID, IsNotEmpty, IsEnum, IsOptional,
} from 'class-validator';
import { IsMutuallyExclusiveWith } from '../utils';

/**
 * Defines a new room that will be created alongside the meeting.
 */

abstract class MeetingRoomRequest {
  /**
   * The campus within the university where the room is located
   */
  @ApiModelProperty({
    type: 'string',
    example: 'Cambridge',
  })
  @IsNotEmpty()
  public campus: string;

  /**
   * The name of the building where the room is located
   */
  @ApiModelProperty({
    type: 'string',
    example: 'Maxwell Dworkin',
  })
  @IsNotEmpty()
  public building: string;

  /**
   * The name/number of the room
   */
  @ApiModelProperty({
    type: 'string',
    example: 'G125',
  })
  @IsNotEmpty()
  public name: string;

  /**
   * The number of people that can use the room at one time
   */
  @ApiModelProperty({
    type: 'number',
    example: '80',
  })
  @IsOptional()
  public capacity?: number;
}

/**
 * Represents a request sent to the server to create or edit a meeting
 * associated with a course instance or non class event
 */

export default abstract class MeetingRequest {
  /**
   * If this is an existing meeting being edited, this will be the UUID in our
   * database.
   */
  @ApiModelProperty({
    type: 'string',
    example: '7187d276-f6cf-4323-af7d-dd70f4a08e3d',
  })
  @IsUUID()
  public id: string;

  /**
   * The day of the week on which the meeting takes place.
   */
  @ApiModelProperty({
    type: 'string',
    example: DAY.MON,
  })
  @IsNotEmpty()
  @IsEnum(DAY)
  public day: DAY;

  /**
   * The time at which the meeting starts
   */
  @ApiModelProperty({
    type: 'string',
    example: '12:00:00-5',
  })
  @IsNotEmpty()
  public startTime: string;

  /**
   * The time at which the meeting ends
   */
  @ApiModelProperty({
    type: 'string',
    example: '13:30:00-5',
  })
  @IsNotEmpty()
  public endTime: string;

  /**
   * The ID of a [[CourseInstance]] to which the meeting belongs.
   * Either this or a [[NonClassEvent]] id must be provided.
   */
  @ApiModelProperty({
    type: 'string',
    example: 'ec141394-4011-485d-bba5-173b9fdef04d',
  })
  @IsUUID()
  @IsMutuallyExclusiveWith(['nonClassEventId'])
  public courseInstanceId?: string;

  /**
   * The ID of a [[NonClassEvent]] to which the meeting belongs.
   * Either this or a [[CourseInstance]] id must be provided.
   */
  @ApiModelProperty({
    type: 'string',
    example: '56a825b0-8860-4434-b843-c530a86138a1',
  })
  @IsUUID()
  @IsMutuallyExclusiveWith(['courseInstanceId'])
  public nonClassEventId?: string;

  /**
   * Identifies an existing room in the database where the meeting will be held
   * Either this or [[MeetingRoomRequest]] must be defined
   */
  @ApiModelProperty({
    type: 'string',
    example: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
  })
  @IsUUID()
  @IsMutuallyExclusiveWith(['room'])
  public roomId?: string;

  /**
   * Defines a new room that should be created in database where the meeting
   * will be held.  Either this or [[MeetingRoomRequest]] must be defined
   */
  @ApiModelProperty({
    type: MeetingRoomRequest,
  })
  @IsMutuallyExclusiveWith(['roomId'])
  public room?: MeetingRoomRequest;
}