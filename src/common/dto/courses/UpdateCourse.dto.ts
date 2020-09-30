import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import {
  IsBoolean,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

/**
 * @module Server.DTOS.Courses
 */

export abstract class UpdateCourseDTO {
  @IsNotEmpty()
  public area: string;

  @ApiModelProperty({
    example: 'df15cfff-0f6f-4769-8841-1ab8a9c335d9',
  })
  @IsUUID()
  @IsNotEmpty()
  public id: string;

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
  @IsEnum(TERM_PATTERN)
  public termPattern: TERM_PATTERN;
}
