import { ApiProperty } from '@nestjs/swagger';
import {
  DAY, OFFERED, TERM_PATTERN, IS_SEAS,
} from 'common/constants';

/**
 * @module Server.DTOS.Courses
 */

abstract class Instance {
  @ApiProperty({
    type: 'string',
    example: 'ec141394-4011-485d-bba5-173b9fdef04d',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: '2016',
  })
  public calendarYear: string;

  @ApiProperty({
    type: 'string',
    example: OFFERED.Y,
    enum: OFFERED,
  })
  public offered: OFFERED;

  @ApiProperty({
    isArray: true,
    example: [
      {
        id: '5c8e015f-eae6-4586-9eb0-fc7d243403bf',
        displayName: 'Rogers, Chris',
        notes: 'Prefers Cambridge campus',
      },
      {
        id: 'effb8b1f-0525-42d0-bcbe-29206121d8ac',
        displayName: 'Waldo, James',
        notes: 'Prefers Allston campus',
      },
    ],
    default: [],
  })
  public instructors: {
    id: string;
    displayName: string;
    notes?: string;
  }[] = [];

  @ApiProperty({
    example: [
      {
        id: '7187d276-f6cf-4323-af7d-dd70f4a08e3d',
        day: DAY.TUE,
        startTime: '12:00:00',
        endTime: '13:00:00',
        room: {
          id: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
          campus: 'Cambridge',
          name: 'Maxwell Dworkin 119',
        },
      },
    ],
    isArray: true,
  })
  public meetings: {
    id: string;
    day: DAY;
    startTime: string;
    endTime: string;
    room: {
      id: string;
      campus: string;
      name: string;
    };
  }[];

  @ApiProperty({
    type: 'number',
    example: 15,
  })
  public preEnrollment: number;

  @ApiProperty({
    type: 'number',
    example: 12,
  })
  public studyCardEnrollment: number;

  @ApiProperty({
    type: 'number',
    example: 8,
  })
  public actualEnrollment: number;
}

export default abstract class CourseInstanceResponseDTO {
  @ApiProperty({
    type: 'string',
    example: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: 'ACS',
  })
  public area: string;

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  public isUndergraduate: boolean;

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
    type: 'string',
    example: 'CS 050',
  })
  public sameAs: string;

  @ApiProperty({
    type: 'string',
    enum: IS_SEAS,
    example: true,
  })
  public isSEAS: IS_SEAS;

  @ApiProperty({
    type: Instance,
  })
  public spring: Instance;

  @ApiProperty({
    type: Instance,
  })
  public fall: Instance;

  @ApiProperty({
    type: 'string',
    example: 'Taking place in a larger room this year',
    default: '',
  })
  public notes?: string;

  @ApiProperty({
    type: 'string',
    enum: TERM_PATTERN,
  })
  public termPattern: TERM_PATTERN;
}
