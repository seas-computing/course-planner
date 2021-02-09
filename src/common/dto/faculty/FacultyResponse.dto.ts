import { ApiModelProperty } from '@nestjs/swagger';
import { FACULTY_TYPE, ABSENCE_TYPE } from 'common/constants';

export abstract class FacultyCourse {
  @ApiModelProperty({
    type: 'string',
    example: '37b66373-5000-43f2-9c14-8c2426273785',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'CS 50',
  })
  public catalogNumber: string;
}

export abstract class FacultyAbsence {
  @ApiModelProperty({
    type: 'string',
    example: 'f696d531-aef2-413f-9922-f480aa9d6039',
  })
  public id: string;

  @ApiModelProperty({
    example: ABSENCE_TYPE.SABBATICAL,
    enum: ABSENCE_TYPE,
  })
  public type: ABSENCE_TYPE;
}

export abstract class FacultySemester {
  @ApiModelProperty({
    type: 'string',
    example: '4c15c2bf-7823-47e0-9954-2ce914b73595',
  })
  public id: string;

  @ApiModelProperty({
    type: 'number',
    example: 2021,
  })
  public academicYear: number;

  @ApiModelProperty({
    isArray: true,
    type: FacultyCourse,
  })
  public courses: FacultyCourse[];

  @ApiModelProperty({
    type: FacultyAbsence,
  })
  public absence: FacultyAbsence;
}

export abstract class FacultyResponseDTO {
  @ApiModelProperty({
    type: 'string',
    example: '4c15c2bf-7823-47e0-9954-2ce914b73595',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'Chris',
  })
  public firstName?: string;

  @ApiModelProperty({
    type: 'string',
    example: 'Rogers',
  })
  public lastName?: string;

  @ApiModelProperty({
    example: FACULTY_TYPE.LADDER,
    enum: FACULTY_TYPE,
  })
  public category: FACULTY_TYPE;

  @ApiModelProperty({
    type: 'string',
    example: 'EPS (0.5 FTE SEAS)',
  })
  public jointWith?: string;

  @ApiModelProperty({
    type: 'string',
    example: 'Prefers classroom near Maxwell-Dworkin',
  })
  public notes?: string;

  @ApiModelProperty({
    type: 'string',
    example: 'AM',
  })
  public area: string;

  @ApiModelProperty({
    type: FacultySemester,
  })
  public fall: FacultySemester;

  @ApiModelProperty({
    type: FacultySemester,
  })
  public spring: FacultySemester;
}
