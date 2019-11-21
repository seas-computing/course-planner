import { ApiModelProperty } from '@nestjs/swagger';
import FACULTY_TYPE from '../../constants/facultyType';

export abstract class ManageFacultyDTO {
  @ApiModelProperty({
    example: 'CS',
  })
  public coursePrefix: string;

  @ApiModelProperty({
    example: '80881118',
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
    example: FACULTY_TYPE.NON_SEAS_LADDER,
  })
  public facultyType: FACULTY_TYPE;
}
