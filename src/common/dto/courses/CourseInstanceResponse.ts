import { ApiModelProperty } from '@nestjs/swagger';
import {
  DAY, OFFERED, TERM_PATTERN, IS_SEAS,
} from 'common/constants';

/**
 * @module Server.DTOS.Courses
 */

abstract class Instance {
  @ApiModelProperty({
    type: 'string',
    example: 'ec141394-4011-485d-bba5-173b9fdef04d',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: '2016',
  })
  public calendarYear: string;

  @ApiModelProperty({
    type: 'string',
    example: OFFERED.Y,
    enum: OFFERED,
  })
  public offered: OFFERED;

  @ApiModelProperty({
    isArray: true,
    example: [
      {
        id: '5c8e015f-eae6-4586-9eb0-fc7d243403bf',
        displayName: 'Rogers, Chris',
      },
      {
        id: 'effb8b1f-0525-42d0-bcbe-29206121d8ac',
        displayName: 'Waldo, James',
      },
    ],
    default: [],
  })
  public instructors: {
    id: string;
    displayName: string;
  }[] = [];

  @ApiModelProperty({
    example: [
      {
        id: '7187d276-f6cf-4323-af7d-dd70f4a08e3d',
        day: DAY.TUE,
        startTime: '12:00:00-5',
        endTime: '13:00:00-5',
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

  @ApiModelProperty({
    type: 'number',
    example: 15,
  })
  public preEnrollment: number;

  @ApiModelProperty({
    type: 'number',
    example: 12,
  })
  public studyCardEnrollment: number;

  @ApiModelProperty({
    type: 'number',
    example: 8,
  })
  public actualEnrollment: number;
}

export default abstract class CourseInstanceResponseDTO {
  @ApiModelProperty({
    type: 'string',
    example: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'ACS',
  })
  public area: string;

  @ApiModelProperty({
    type: 'boolean',
    example: false,
  })
  public isUndergraduate: boolean;

  @ApiModelProperty({
    type: 'string',
    example: 'AM 10',
  })
  public catalogNumber: string;

  @ApiModelProperty({
    type: 'string',
    example: 'Applied Math for computation',
  })
  public title: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS 050',
  })
  public sameAs: string;

  @ApiModelProperty({
    type: 'string',
    enum: IS_SEAS,
    example: true,
  })
  public isSEAS: IS_SEAS;

  @ApiModelProperty({
    type: Instance,
  })
  public spring: Instance;

  @ApiModelProperty({
    type: Instance,
  })
  public fall: Instance;

  @ApiModelProperty({
    type: 'string',
    example: 'Taking place in a larger room this year',
    default: '',
  })
  public notes?: string;

  @ApiModelProperty({
    type: 'string',
    enum: TERM_PATTERN,
  })
  public termPattern: TERM_PATTERN;
}
