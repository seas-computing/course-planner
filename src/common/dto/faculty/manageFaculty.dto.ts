import { ApiModelProperty } from '@nestjs/swagger';
import { FACULTY_TYPE } from '../../constants';

export abstract class ManageFacultyResponseDTO {
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
  public firstName: string;

  @ApiModelProperty({
    example: 'Johnston',
  })
  public lastName: string;

  @ApiModelProperty({
    example: FACULTY_TYPE.LADDER,
  })
  public facultyType: FACULTY_TYPE;

  @ApiModelProperty({
    example: 'CS',
  })
  public area: string;

  @ApiModelProperty({
    example: 'EPS (0.5 FTE SEAS)',
  })
  public jointWith?: string;
}
