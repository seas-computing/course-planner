import { ApiProperty } from '@nestjs/swagger';
import { FACULTY_TYPE, ABSENCE_TYPE } from 'common/constants';

export abstract class FacultyCourse {
  @ApiProperty({
    type: 'string',
    example: '37b66373-5000-43f2-9c14-8c2426273785',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: 'CS 50',
  })
  public catalogNumber: string;

  @ApiProperty({
    type: 'string',
    example: 'AC 209A, CS 109A',
  })
  public sameAs: string;
}

export abstract class FacultyAbsence {
  @ApiProperty({
    type: 'string',
    example: 'f696d531-aef2-413f-9922-f480aa9d6039',
  })
  public id: string;

  @ApiProperty({
    example: ABSENCE_TYPE.SABBATICAL,
    enum: ABSENCE_TYPE,
  })
  public type: ABSENCE_TYPE;
}

export abstract class FacultySemester {
  @ApiProperty({
    type: 'string',
    example: '4c15c2bf-7823-47e0-9954-2ce914b73595',
  })
  public id: string;

  @ApiProperty({
    type: 'number',
    example: 2021,
  })
  public academicYear: number;

  @ApiProperty({
    isArray: true,
    type: FacultyCourse,
  })
  public courses: FacultyCourse[];

  @ApiProperty({
    type: FacultyAbsence,
  })
  public absence: FacultyAbsence;
}

export abstract class FacultyResponseDTO {
  @ApiProperty({
    type: 'string',
    example: '4c15c2bf-7823-47e0-9954-2ce914b73595',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: 'Chris',
  })
  public firstName?: string;

  @ApiProperty({
    type: 'string',
    example: 'Rogers',
  })
  public lastName?: string;

  @ApiProperty({
    example: FACULTY_TYPE.LADDER,
    enum: FACULTY_TYPE,
  })
  public category: FACULTY_TYPE;

  @ApiProperty({
    type: 'string',
    example: 'EPS (0.5 FTE SEAS)',
  })
  public jointWith?: string;

  @ApiProperty({
    type: 'string',
    example: 'Prefers classroom near Maxwell-Dworkin',
  })
  public notes?: string;

  @ApiProperty({
    type: 'string',
    example: 'AM',
  })
  public area: string;

  @ApiProperty({
    type: FacultySemester,
  })
  public fall: FacultySemester;

  @ApiProperty({
    type: FacultySemester,
  })
  public spring: FacultySemester;
}
