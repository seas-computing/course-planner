import { ApiProperty } from '@nestjs/swagger';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import { CourseArea } from './CourseArea.dto';

export abstract class ManageCourseResponseDTO {
  @ApiProperty({
    example: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
  })
  public id: string;

  @ApiProperty({
    example: 'Computational Modeling of Fluids and Soft Matter',
  })
  public title: string;

  @ApiProperty({
    type: CourseArea,
  })
  public area: CourseArea;

  @ApiProperty({
    example: 'AP',
  })
  public prefix?: string;

  @ApiProperty({
    example: '227',
  })
  public number?: string;

  @ApiProperty({
    example: 'AP 227',
  })
  public catalogNumber: string;

  @ApiProperty({
    example: TERM_PATTERN.FALL,
    enum: TERM_PATTERN,
  })
  public termPattern?: TERM_PATTERN;

  @ApiProperty({
    example: false,
  })
  public isUndergraduate: boolean;

  @ApiProperty({
    example: true,
  })
  public isSEAS: IS_SEAS;

  @ApiProperty({
    example: 'AC 227',
  })
  public sameAs?: string;

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  public private: boolean;
}
