import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import {
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';

/**
 * @module Server.DTOS.Courses
 */

export abstract class CreateCourse {
  @IsNotEmpty()
  public area: string;

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
  @IsOptional()
  public prefix?: string;

  @ApiModelProperty({
    type: 'string',
    example: '109b',
  })
  @IsString()
  @IsOptional()
  public number?: string;

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
    example: IS_SEAS.Y,
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
  @IsBoolean()
  @IsOptional()
  public private: boolean;

  @ApiModelProperty({
    type: 'string',
    enum: TERM_PATTERN,
  })
  @IsNotEmpty()
  @IsEnum(TERM_PATTERN)
  public termPattern: TERM_PATTERN;
}
