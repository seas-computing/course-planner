import { ApiProperty } from '@nestjs/swagger';
import { TERM } from 'common/constants';

export abstract class MultiYearPlanInstanceFaculty {
  @ApiProperty({
    type: 'string',
    example: 'f696d531-aef2-413f-9922-f480aa9d6039',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: 'Waldo, James',
  })
  public displayName: string;

  @ApiProperty({
    type: 'number',
    example: 0,
  })
  public instructorOrder: number;
}

export abstract class MultiYearPlanInstance {
  @ApiProperty({
    type: 'string',
    example: '1f8cc026-d8bf-429d-9fdb-32b89cfdce9d',
  })
  public id: string;

  @ApiProperty({
    isArray: true,
    type: MultiYearPlanInstanceFaculty,
  })
  public faculty: MultiYearPlanInstanceFaculty[];
}

export abstract class MultiYearPlanSemester {
  @ApiProperty({
    type: 'string',
    example: 'fc772fd6-651e-40c3-97e6-b815818120ce',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: '2019',
  })
  public academicYear: string;

  @ApiProperty({
    type: 'string',
    example: '2019',
  })
  public calendarYear: string;

  @ApiProperty({
    type: 'string',
    example: TERM.SPRING,
  })
  public term: TERM;

  @ApiProperty({
    type: MultiYearPlanInstance,
  })
  public instance: MultiYearPlanInstance;
}

export abstract class MultiYearPlanResponseDTO {
  @ApiProperty({
    type: 'string',
    example: '37b66373-5000-43f2-9c14-8c2426273785',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: 'AP',
  })
  public catalogPrefix: string;

  @ApiProperty({
    type: 'string',
    example: 'AP 227',
  })
  public catalogNumber: string;

  @ApiProperty({
    type: 'string',
    example: 'Electron Microscopy Laboratory',
  })
  public title: string;

  @ApiProperty({
    isArray: true,
    type: MultiYearPlanSemester,
  })
  public semesters: MultiYearPlanSemester[];
}
