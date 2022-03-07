import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsNumber()
  public preEnrollment?: number;

  @ApiProperty({
    type: 'number',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  public studyCardEnrollment?: number;

  @ApiProperty({
    type: 'number',
    example: 8,
  })
  @IsOptional()
  @IsNumber()
  public actualEnrollment?: number;
}
