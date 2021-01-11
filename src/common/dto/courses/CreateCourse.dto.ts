import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import {
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { trimIfString } from '../util';

/**
 * @module Server.DTOS.Courses
 */

export abstract class CreateCourse {
  @IsNotEmpty()
  @Transform(trimIfString)
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
  @Transform(trimIfString)
  public title: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS',
  })
  @IsString()
  @IsOptional()
  @Transform(trimIfString)
  public prefix?: string;

  @ApiModelProperty({
    type: 'string',
    example: '109b',
  })
  @IsString()
  @IsOptional()
  @Transform(trimIfString)
  public number?: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS 050',
  })
  @IsString()
  @IsOptional()
  @Transform(trimIfString)
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
