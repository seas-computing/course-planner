import { ApiProperty } from '@nestjs/swagger';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import {
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { trimString } from '../utils';

/**
 * @module Server.DTOS.Courses
 */

export abstract class CreateCourse {
  @IsNotEmpty()
  @Transform(trimString)
  public area: string;

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  public isUndergraduate: boolean;

  @ApiProperty({
    type: 'string',
    example: 'Applied Math for computation',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  public title: string;

  @ApiProperty({
    type: 'string',
    example: 'CS',
  })
  @IsString()
  @IsOptional()
  @Transform(trimString)
  public prefix?: string;

  @ApiProperty({
    type: 'string',
    example: '109b',
  })
  @IsString()
  @IsOptional()
  @Transform(trimString)
  public number?: string;

  @ApiProperty({
    type: 'string',
    example: 'CS 050',
  })
  @IsString()
  @IsOptional()
  @Transform(trimString)
  public sameAs?: string;

  @ApiProperty({
    type: 'string',
    enum: IS_SEAS,
    example: IS_SEAS.Y,
  })
  @IsEnum(IS_SEAS)
  @IsNotEmpty()
  public isSEAS: IS_SEAS;

  @ApiProperty({
    type: 'boolean',
    example: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  public private: boolean;

  @ApiProperty({
    type: 'string',
    enum: TERM_PATTERN,
  })
  @IsNotEmpty()
  @IsEnum(TERM_PATTERN)
  public termPattern: TERM_PATTERN;
}
