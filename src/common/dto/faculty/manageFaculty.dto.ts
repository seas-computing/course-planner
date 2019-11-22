import { ApiModelProperty } from '@nestjs/swagger';
import { FACULTY_TYPE } from '../../constants';

export abstract class ManageFacultyDTO {
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
  public coursePrefix: string;

  @ApiModelProperty({
    example: 'EPS (0.5 FTE SEAS)',
  })
  public jointWith: string | null;
}
