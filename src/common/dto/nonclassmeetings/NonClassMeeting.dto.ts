import { DAY, TERM_PATTERN, TERM } from 'common/constants';
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
  public isSEAS: boolean

  @ApiModelProperty({
    example: false,
  })
  public isUndergraduate: boolean;

  @ApiModelProperty({
    example: 'Same as CS 109a, STATS 121a',
  })
  public notes: string;

  @ApiModelProperty({
    type: 'enum',
    enum: TERM_PATTERN,
    example: TERM_PATTERN.FALL,
  })
  public termPattern: TERM_PATTERN;
}

abstract class Room {
  @ApiModelProperty({
    description: 'The room ID',
    example: 'b205ec82-1694-4269-887a-3030fdc65d92',
  })
  public id: string;

  @ApiModelProperty({
    example: 'Geological Museum 105',
  })
  public name: string;
}

abstract class MeetingLocation {
  @ApiModelProperty({
    example: 'Allston',
  })
  public campus: string;

  @ApiModelProperty({
    example: 'Maxwell-Dworkin',
  })
  public building: string;

  @ApiModelProperty({ type: Room })
  public room: Room;
}

abstract class MeetingSemester {
  @ApiModelProperty({
    description: 'Semester PK ID',
    example: '93a6ddba-f026-4157-b913-351bb8fbe12d',
  })
  public id: string;

  @ApiModelProperty({
    description: 'Academic year in YYYY format',
    example: '2011',
  })
  public academicYear: string;

  @ApiModelProperty({
    description: 'An indicator of the term this semester takes place in',
    example: TERM.FALL,
    type: 'enum',
    enum: TERM,
  })
  public term: TERM;
}

abstract class NonClassEvent {
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

  @ApiModelProperty({ type: MeetingLocation })
  public room: MeetingLocation;

  @ApiModelProperty({ type: MeetingSemester })
  public semester: MeetingSemester;
}

export default abstract class NonClassMeetingResponseDTO {
  @ApiModelProperty({
    description: 'NonClassParent id',
    example: '56a825b0-8860-4434-b843-c530a86138a1',
  })
  public id: string;

  @ApiModelProperty({
    description: 'The title of this non class meeting',
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
