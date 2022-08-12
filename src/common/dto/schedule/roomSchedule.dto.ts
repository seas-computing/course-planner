import { ApiProperty } from '@nestjs/swagger';
import { DAY } from 'common/constants';

export abstract class RoomScheduleInstructors {
  @ApiProperty({
    type: 'string',
    example: 'effb8b1f-0525-42d0-bcbe-29206121d8ac',
  })
  id: string;

  @ApiProperty({
    type: 'string',
    example: 'Waldo, James',
  })
  displayName: string;

  @ApiProperty({
    type: 'string',
    example: 'Prefers room with a whiteboard',
  })
  notes: string;

  @ApiProperty({
    type: 'number',
    example: 0,
  })
  instructorOrder: number;
}

export abstract class RoomScheduleResponseDTO {
  @ApiProperty({
    example: 'CS50MON10301200SPRING2022',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: 'AM 10',
  })
  public catalogNumber: string;

  @ApiProperty({
    type: 'string',
    example: 'Applied Math for computation',
  })
  public title: string;

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  public isUndergraduate: boolean;

  @ApiProperty({
    type: RoomScheduleInstructors,
    isArray: true,
    example: [
      {
        id: '5c8e015f-eae6-4586-9eb0-fc7d243403bf',
        displayName: 'Rogers, Chris',
        notes: 'Prefers room with whiteboard',
        instructorOrder: 1,
      },
      {
        id: 'effb8b1f-0525-42d0-bcbe-29206121d8ac',
        displayName: 'Waldo, James',
        notes: 'Prefers Allston campus',
        instructorOrder: 0,
      },
    ],
    default: [],
  })
  public instructors: RoomScheduleInstructors[] = [];

  @ApiProperty({
    enum: DAY,
    example: DAY.WED,
  })
  public weekday: DAY;

  @ApiProperty({
    example: 10,
  })
  public startHour: number;

  @ApiProperty({
    example: 30,
  })
  public startMinute: number;

  @ApiProperty({
    example: 12,
  })
  public endHour: number;

  @ApiProperty({
    example: 0,
  })
  public endMinute: number;

  @ApiProperty({
    example: 90,
  })
  public duration: number;
}
