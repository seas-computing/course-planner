import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import {
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { CourseArea } from './CourseArea.dto';

/**
 * @module Server.DTOS.Courses
 */

export abstract class CreateCourse {
  @ApiModelProperty({
    type: CourseArea,
  })
  @IsNotEmpty()
  public area: CourseArea;

  @ApiModelProperty({
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  public isUndergraduate: boolean;

  @ApiModelProperty({
    type: 'string',
    example: 'Applied Math for computation',
  })
  @IsString()
  @IsNotEmpty()
  public title: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS',
  })
  @IsString()
  @IsNotEmpty()
  public prefix: string;

  @ApiModelProperty({
    type: 'string',
    example: '109b',
  })
  @IsString()
  @IsNotEmpty()
  public number: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS 050',
  })
  @IsString()
  @IsOptional()
  public sameAs?: string;

  @ApiModelProperty({
    type: 'string',
    enum: IS_SEAS,
    example: true,
  })
  @IsEnum(IS_SEAS)
  @IsNotEmpty()
  public isSEAS: IS_SEAS;

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
  @IsNotEmpty()
  @IsBoolean()
  public private: boolean;

  @ApiModelProperty({
    type: 'string',
    enum: TERM_PATTERN,
  })
  @IsNotEmpty()
  @IsEnum(TERM_PATTERN)
  public termPattern: TERM_PATTERN;
}
