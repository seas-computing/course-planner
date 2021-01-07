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

/**
 * @module Server.DTOS.Courses
 */

export abstract class CreateCourse {
  @IsNotEmpty()
  @Transform((value: string) => value?.trim())
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
  @Transform((value: string) => value?.trim())
  public title: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS',
  })
  @IsString()
  @IsOptional()
  @Transform((value: string) => value?.trim())
  public prefix?: string;

  @ApiModelProperty({
    type: 'string',
    example: '109b',
  })
  @IsString()
  @IsOptional()
  @Transform((value: string) => value?.trim())
  public number?: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS 050',
  })
  @IsString()
  @IsOptional()
  @Transform((value: string) => value?.trim())
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
