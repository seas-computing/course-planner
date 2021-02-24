import {
  DAY, TERM,
} from 'common/constants';
import { ApiModelProperty } from '@nestjs/swagger';

abstract class Location {
  @ApiModelProperty({
    example: 'e77babce-1a85-4d5f-9d24-1c581b6bf6bb',
  })
  public id: string;

  @ApiModelProperty({
    example: 'Allston',
  })
  public campus: string;

  @ApiModelProperty({
    example: 'Geological Museum 105',
  })
  public name: string;
}

abstract class Meeting {
  @ApiModelProperty({
    example: '526ba3b-87d5-40d0-be89-b0d3b6bef5f7',
  })
  public id: string;

  @ApiModelProperty({
    type: 'enum',
    enum: DAY,
    example: DAY.FRI,
  })
  public day: DAY;

  @ApiModelProperty({
    example: '06:00 PM',
  })
  public startTime: string;

  @ApiModelProperty({
    example: '07:00 PM',
  })
  public endTime: string;

  @ApiModelProperty({ type: Location })
  public room: Location;
}

abstract class NonClassEvent {
  @ApiModelProperty({
    description: 'NonClassEvent ID',
    example: 'dbd48f1-8233-4770-a73c-3c034e7250a0',
  })
  public id: string;

  @ApiModelProperty({
    description: 'Denotes whether this NonClassEvent occurs in'
      + ` ${TERM.SPRING} or ${TERM.FALL}`,
    type: 'enum',
    enum: TERM,
    example: TERM.SPRING,
  })
  public term: TERM;

  @ApiModelProperty({
    type: Meeting,
    isArray: true,
  })
  public meetings: Meeting[];
}

export default abstract class NonClassMeetingResponseDTO {
  @ApiModelProperty({
    description: 'NonClassParent ID',
    example: '56a825b0-8860-4434-b843-c530a86138a1',
  })
  public id: string;

  @ApiModelProperty({
    description: 'The title of this non class parent',
    example: 'Reading group',
  })
  public title: string;

  @ApiModelProperty({ type: NonClassEvent })
  public spring: NonClassEvent;

  @ApiModelProperty({ type: NonClassEvent })
  public fall: NonClassEvent;
}
