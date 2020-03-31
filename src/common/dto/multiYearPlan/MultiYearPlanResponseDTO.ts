import { ApiModelProperty } from '@nestjs/swagger';
import { TERM_PATTERN } from 'common/constants';
import { string } from 'testData';

abstract class Faculty {
  @ApiModelProperty({
    type: string,
    example: 'f696d531-aef2-413f-9922-f480aa9d6039',
  })
  public id: string;

  @ApiModelProperty({
    type: string,
    example: 'Waldo, James',
  })
  public displayName: string;
}

abstract class Instances {
  @ApiModelProperty({
    type: 'string',
    example: 'fc772fd6-651e-40c3-97e6-b815818120ce',
  })
  public id: string;

  @ApiModelProperty({
    type: 'number',
    example: 2011,
  })
  public calendarYear: number;

  @ApiModelProperty({
    type: 'string',
    example: TERM_PATTERN.FALL,
  })
  public term: TERM_PATTERN;

  @ApiModelProperty({
    isArray: true,
    type: Faculty,
  })
  public faculty: Faculty[];
}

abstract class Courses {
  @ApiModelProperty({
    type: 'string',
    example: '37b66373-5000-43f2-9c14-8c2426273785',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'AP',
  })
  public area: string;

  @ApiModelProperty({
    example: 'AP 227',
  })
  public catalogNumber: string;

  @ApiModelProperty({
    type: 'string',
    example: 'Electron Microscopy Laboratory',
  })
  public title: string;

  @ApiModelProperty({
    isArray: true,
    type: Instances,
  })
  public instances: Instances[];
}

export abstract class MultiYearPlanResponseDTO {
  @ApiModelProperty({
    type: Courses,
    isArray: true,
  })
  public semesters: Courses[];
}
