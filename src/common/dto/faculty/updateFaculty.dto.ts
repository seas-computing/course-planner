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
    example: 'b38dcc00-0f2d-4d8f-9096-b5173067b22b',
  })
  @IsUUID()
  public id: string;

  @ApiModelProperty({
    type: 'string',
    example: 'AP',
  })
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export abstract class UpdateFacultyDTO {
  @ApiModelProperty({
    example: '87654321',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(8, 8)
  public HUID: string;

  @ApiModelProperty({
    example: 'Ada',
  })
  @ValidateIf(({ lastName }): boolean => lastName === undefined)
  @IsNotEmpty()
  public firstName?: string;

  @ApiModelProperty({
    example: 'Lovelace',
  })
  @ValidateIf(({ firstName }): boolean => firstName === undefined)
  @IsNotEmpty()
  public lastName?: string;

  @ApiModelProperty({
    example: FACULTY_TYPE.NON_SEAS_LADDER,
    enum: FACULTY_TYPE,
  })
  @IsEnum(FACULTY_TYPE)
  public facultyType: FACULTY_TYPE;

  @ApiModelProperty({
    type: FacultyArea,
  })
  @IsNotEmptyObject()
  public area: FacultyArea;

  @ApiModelProperty({
    example: 'PHYS (1 FTE SEAS)',
  })
  @IsOptional()
  @IsString()
  public jointWith?: string;
}
