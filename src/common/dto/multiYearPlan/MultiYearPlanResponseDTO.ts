import { ApiModelProperty } from '@nestjs/swagger';
import { TERM } from 'common/constants';

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
    example: '1f8cc026-d8bf-429d-9fdb-32b89cfdce9d',
  })
  public id: string;

  @ApiModelProperty({
    isArray: true,
    type: MultiYearPlanInstanceFaculty,
  })
  public faculty: MultiYearPlanInstanceFaculty[];
}

export abstract class MultiYearPlanSemester {
  @ApiModelProperty({
    type: 'string',
    example: 'fc772fd6-651e-40c3-97e6-b815818120ce',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: '2019',
  })
  public academicYear: string;

  @ApiModelProperty({
    type: 'string',
    example: '2019',
  })
  public calendarYear: string;

  @ApiModelProperty({
    type: 'string',
    example: TERM.SPRING,
  })
  public term: TERM;

  @ApiModelProperty({
    type: MultiYearPlanInstance,
  })
  public instance: MultiYearPlanInstance;
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
  public catalogPrefix: string;

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
    type: MultiYearPlanSemester,
  })
  public semesters: MultiYearPlanSemester[];
}
