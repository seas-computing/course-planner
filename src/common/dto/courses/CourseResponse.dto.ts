import { ApiModelProperty } from '@nestjs/swagger';
import { DAY, OFFERED } from 'common/constants';

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
    example: OFFERED.Y,
    enum: OFFERED,
  })
  public offered: OFFERED;

  @ApiModelProperty({
    isArray: true,
    example: [
      {
        id: '5c8e015f-eae6-4586-9eb0-fc7d243403bf',
        firstName: 'Chris',
        lastName: 'Rogers',
      },
      {
        id: 'effb8b1f-0525-42d0-bcbe-29206121d8ac',
        firstName: 'James',
        lastName: 'Waldo',
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
        startTime: {
          hour: 12,
          minute: 0,
        },
        endTime: {
          hour: 13,
          minute: 0,
        },
      },
    ],
    isArray: true,
  })
  public times: {
    id: string;
    day: DAY;
    startTime: {
      hour: number;
      minute: number;
    };
    endTime: {
      hour: number;
      minute: number;
    };
  }[];

  @ApiModelProperty({
    example: {
      id: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
      room: 'Maxwell Dworkin 119',
    },
  })
  public room: {
    id: string;
    name: string;
  };

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

export default abstract class CourseResponseDTO {
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
    type: 'string',
    example: 'AM 10',
  })
  public ccn: string;

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
    type: 'boolean',
    example: true,
  })
  public isSEAS: boolean;

  @ApiModelProperty({
    type: Instance,
    isArray: true,
  })
  public fall: Instance[] = [];

  @ApiModelProperty({
    type: Instance,
    isArray: true,
  })
  public spring: Instance[] = [];

  @ApiModelProperty({
    type: 'string',
    example: 'Taking place in a larger room this year',
    default: '',
  })
  public notes?: string;

  @ApiModelProperty({
    type: 'string',
    example: 'Some example details',
    default: '',
  })
  public detail?: string;
}
