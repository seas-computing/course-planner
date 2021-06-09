import { ApiProperty } from '@nestjs/swagger';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import {
  IsBoolean,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { trimString } from '../utils';

/**
 * @module Server.DTOS.Courses
 */

export abstract class UpdateCourseDTO {
  @IsNotEmpty()
  @Transform(trimString)
  public area: string;

  @ApiProperty({
    example: 'df15cfff-0f6f-4769-8841-1ab8a9c335d9',
  })
  @IsUUID()
  @IsNotEmpty()
  public id: string;

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
    example: true,
  })
  @IsEnum(IS_SEAS)
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
  @IsEnum(TERM_PATTERN)
  public termPattern: TERM_PATTERN;
}
