import { ApiModelProperty } from '@nestjs/swagger';
import { ABSENCE_TYPE } from 'server/absence/absence.entity';
import { FACULTY_TYPE } from '../../constants';

export abstract class FacultySemester {
  @ApiModelProperty({
    isArray: true,
    example: ['AM 10', 'CS 50', 'ES 121'],
  })
  public catalogNumbers: string[];

  @ApiModelProperty({
    type: 'string',
    enum: ABSENCE_TYPE,
  })
  public absence: ABSENCE_TYPE;
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
    example: 'AM',
  })
  public area: string;

  @ApiModelProperty({
    type: FacultySemester,
  })
  public spring: FacultySemester;

  @ApiModelProperty({
    type: FacultySemester,
  })
  public fall: FacultySemester;
}
