import { ApiModelProperty } from '@nestjs/swagger';
import { FACULTY_TYPE } from '../../constants';

export abstract class FacultyArea {
  @ApiModelProperty({
    type: 'string',
    example: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
  })
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'ACS',
  })
  public name: string;
}

export abstract class CreateFacultyResponseDTO {
  @ApiModelProperty({
    example: '4c15c2bf-7823-47e0-9954-2ce914b73595',
  })
  public id: string;

  @ApiModelProperty({
    example: '12345678',
  })
  public HUID: string;

  @ApiModelProperty({
    example: 'Samantha',
  })
  public firstName?: string;

  @ApiModelProperty({
    example: 'Johnston',
  })
  public lastName?: string;

  @ApiModelProperty({
    example: FACULTY_TYPE.LADDER,
    enum: FACULTY_TYPE,
  })
  public facultyType: FACULTY_TYPE;

  @ApiModelProperty({
    type: FacultyArea,
  })
  public area: FacultyArea;

  @ApiModelProperty({
    example: 'EPS (0.5 FTE SEAS)',
  })
  public jointWith?: string;
}
