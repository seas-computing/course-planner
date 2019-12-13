import { ApiModelProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  IsNotEmptyObject,
  IsNumberString,
  Length,
} from 'class-validator';
import { FACULTY_TYPE } from '../../constants';

export abstract class FacultyArea {
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
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export abstract class CreateFacultyDTO {
  @ApiModelProperty({
    example: '12345678',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(8, 8)
  public HUID: string;

  @ApiModelProperty({
    example: 'Samantha',
  })
  @ValidateIf(({ lastName }): boolean => lastName === undefined)
  @IsNotEmpty()
  public firstName?: string;

  @ApiModelProperty({
    example: 'Johnston',
  })
  @ValidateIf(({ firstName }): boolean => firstName === undefined)
  @IsNotEmpty()
  public lastName?: string;

  @ApiModelProperty({
    example: FACULTY_TYPE.LADDER,
    enum: FACULTY_TYPE,
  })
  @IsEnum(FACULTY_TYPE)
  public category: FACULTY_TYPE;

  @ApiModelProperty({
    type: FacultyArea,
  })
  @IsNotEmptyObject()
  public area: FacultyArea;

  @ApiModelProperty({
    example: 'EPS (0.5 FTE SEAS)',
  })
  @IsOptional()
  @IsString()
  public jointWith?: string;
}
