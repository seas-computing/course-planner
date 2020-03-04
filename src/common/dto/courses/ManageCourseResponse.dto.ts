import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN } from 'common/constants';
import { CourseArea } from './CourseArea.dto';

export abstract class ManageCourseResponseDTO {
  @ApiModelProperty({
    example: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
  })
  public id: string;

  @ApiModelProperty({
    example: 'Computational Modeling of Fluids and Soft Matter',
  })
  public title: string;

  @ApiModelProperty({
    type: CourseArea,
  })
  public area: CourseArea;

  @ApiModelProperty({
    example: 'AP 227',
  })
  public catalogNumber: string;

  @ApiModelProperty({
    example: TERM_PATTERN.FALL,
    enum: TERM_PATTERN,
  })
  public termPattern?: TERM_PATTERN;

  @ApiModelProperty({
    example: false,
  })
  public isUndergraduate: boolean;

  @ApiModelProperty({
    example: true,
  })
  public isSEAS: boolean;

  @ApiModelProperty({
    example: 'AC 227',
  })
  public sameAs?: string;
}
