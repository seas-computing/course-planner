import { ApiModelProperty } from '@nestjs/swagger';
import { TERM } from 'server/semester/semester.entity';

export abstract class MultiYearPlanInstanceFaculty {
  @ApiModelProperty({
    type: 'string',
    example: 'f696d531-aef2-413f-9922-f480aa9d6039',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'Waldo, James',
  })
  public displayName: string;

  @ApiModelProperty({
    type: 'number',
    example: 0,
  })
  public instructorOrder: number;
}

export abstract class MultiYearPlanInstance {
  @ApiModelProperty({
    type: 'string',
    example: 'fc772fd6-651e-40c3-97e6-b815818120ce',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: '2012',
  })
  public academicYear: string;

  @ApiModelProperty({
    type: 'string',
    example: '2011',
  })
  public calendarYear: string;

  @ApiModelProperty({
    type: 'string',
    example: TERM.FALL,
  })
  public term: TERM;

  @ApiModelProperty({
    isArray: true,
    type: MultiYearPlanInstanceFaculty,
  })
  public faculty: MultiYearPlanInstanceFaculty[];
}

export abstract class MultiYearPlanResponseDTO {
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
    type: 'string',
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
    type: MultiYearPlanInstance,
  })
  public instances: MultiYearPlanInstance[];
}
