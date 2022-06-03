import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { OFFERED } from 'common/constants';

/**
 * @module Server.DTOS.Courses
 */

export default abstract class CourseInstanceUpdateDTO {
  @ApiProperty({
    type: 'string',
    example: OFFERED.Y,
    enum: OFFERED,
  })
  @IsEnum(OFFERED)
  public offered: OFFERED;

  @ApiProperty({
    type: 'number',
    example: 15,
  })
  @IsOptional()
  @Min(0)
  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 0,
  }, { message: '$property must be a whole number.' })
  public preEnrollment?: number;

  @ApiProperty({
    type: 'number',
    example: 12,
  })
  @IsOptional()
  @Min(0)
  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 0,
  }, { message: '$property must be a whole number.' })
  public studyCardEnrollment?: number;

  @ApiProperty({
    type: 'number',
    example: 8,
  })
  @IsOptional()
  @Min(0)
  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 0,
  }, { message: '$property must be a whole number.' })
  public actualEnrollment?: number;
}
