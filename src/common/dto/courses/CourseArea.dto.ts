import { ApiModelProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString } from 'class-validator';

export abstract class CourseArea {
  @ApiModelProperty({
    type: 'string',
    example: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
  })
  @IsUUID()
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'ACS',
  })
  @IsNotEmpty()
  @IsString()
  public name: string;
}
