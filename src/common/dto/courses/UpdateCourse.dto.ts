import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN } from 'common/constants';
import {
  IsBoolean,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { CourseArea } from './CourseArea.dto';

/**
 * @module Server.DTOS.Courses
 */

export abstract class UpdateCourseDTO {
  @ApiModelProperty({
    type: CourseArea,
  })
  @IsOptional()
  public area: CourseArea;

  @ApiModelProperty({
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  public isUndergraduate: boolean;

  @ApiModelProperty({
    type: 'string',
    example: 'Applied Math for computation',
  })
  @IsString()
  @IsOptional()
  public title: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS',
  })
  @IsString()
  @IsOptional()
  public prefix: string;

  @ApiModelProperty({
    type: 'string',
    example: '109b',
  })
  @IsString()
  @IsOptional()
  public number: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS 050',
  })
  @IsString()
  @IsOptional()
  public sameAs?: string;

  @ApiModelProperty({
    type: 'boolean',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  public isSEAS: boolean;

  @ApiModelProperty({
    type: 'string',
    example: 'Taking place in a larger room this year',
    default: '',
  })
  @IsString()
  @IsOptional()
  public notes?: string;

  @ApiModelProperty({
    type: 'boolean',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  public private: boolean;

  @ApiModelProperty({
    type: 'string',
    enum: TERM_PATTERN,
  })
  @IsOptional()
  @IsEnum(TERM_PATTERN)
  public termPattern: TERM_PATTERN;
}
