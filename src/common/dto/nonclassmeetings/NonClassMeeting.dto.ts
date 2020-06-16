import {
  DAY, TERM_PATTERN, TERM, IS_SEAS,
} from 'common/constants';
import { ApiModelProperty } from '@nestjs/swagger';
import { CourseArea } from '../courses/CourseArea.dto';

abstract class Course {
  @ApiModelProperty({ type: CourseArea })
  public area: CourseArea;

  @ApiModelProperty({
    example: 'Data Science 1: Introduction to Data Science',
  })
  public title: string;

  @ApiModelProperty({
    example: 'AC 209a',
  })
  public catalogNumber: string;

  @ApiModelProperty({
    example: true,
  })
  public isSEAS: IS_SEAS;

  @ApiModelProperty({
    example: false,
  })
  public isUndergraduate: boolean;

  @ApiModelProperty({
    example: 'Same as CS 109a, STATS 121a',
  })
  public notes?: string = '';

  @ApiModelProperty({
    type: 'enum',
    enum: TERM_PATTERN,
    example: TERM_PATTERN.FALL,
  })
  public termPattern: TERM_PATTERN;
}

abstract class Location {
  @ApiModelProperty({
    example: 'Allston',
  })
  public campus: string;

  @ApiModelProperty({
    example: 'Geological Museum 105',
  })
  public room: string;
}

abstract class Meeting {
  @ApiModelProperty({
    type: 'enum',
    enum: DAY,
    example: DAY.FRI,
  })
  public day: DAY;

  @ApiModelProperty({
    example: '18:00:00.000-04',
  })
  public start: string;

  @ApiModelProperty({
    example: '19:00:00.000-04',
  })
  public end: string;

  @ApiModelProperty({ type: Location })
  public room: Location;
}

abstract class NonClassEvent {
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

  @ApiModelProperty({ type: Course })
  public course: Course;

  @ApiModelProperty({ type: NonClassEvent })
  public spring: NonClassEvent;

  @ApiModelProperty({ type: NonClassEvent })
  public fall: NonClassEvent;
}
