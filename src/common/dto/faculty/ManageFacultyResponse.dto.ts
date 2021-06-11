import { ApiProperty } from '@nestjs/swagger';
import { FACULTY_TYPE } from '../../constants';

export abstract class FacultyArea {
  @ApiProperty({
    type: 'string',
    example: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
  })
  public id: string;

  @ApiProperty({
    type: 'string',
    example: 'ACS',
  })
  public name: string;
}

export abstract class ManageFacultyResponseDTO {
  @ApiProperty({
    example: '4c15c2bf-7823-47e0-9954-2ce914b73595',
  })
  public id: string;

  @ApiProperty({
    example: '12345678',
  })
  public HUID: string;

  @ApiProperty({
    example: 'Samantha',
  })
  public firstName?: string;

  @ApiProperty({
    example: 'Johnston',
  })
  public lastName?: string;

  @ApiProperty({
    example: FACULTY_TYPE.LADDER,
    enum: FACULTY_TYPE,
  })
  public category: FACULTY_TYPE;

  @ApiProperty({
    type: FacultyArea,
  })
  public area: FacultyArea;

  @ApiProperty({
    example: 'EPS (0.5 FTE SEAS)',
  })
  public jointWith?: string;

  @ApiProperty({
    example: 'Prefers classroom near Maxwell-Dworkin',
  })
  public notes?: string;
}
