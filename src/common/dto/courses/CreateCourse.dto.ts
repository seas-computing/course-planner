import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN } from 'common/constants';
import { CourseArea } from './ManageCourseResponse.dto';

/**
 * @module Server.DTOS.Courses
 */

export abstract class CreateCourse {
  @ApiModelProperty({
    type: CourseArea,
  })
  public area: CourseArea;

  @ApiModelProperty({
    type: 'boolean',
    example: false,
  })
  public isUndergraduate: boolean;

  @ApiModelProperty({
    type: 'string',
    example: 'Applied Math for computation',
  })
  public title: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS',
  })
  public prefix: string;

  @ApiModelProperty({
    type: 'string',
    example: '109b',
  })
  public number: string;

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
