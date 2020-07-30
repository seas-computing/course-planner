import { ApiModelProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
  IsNumberString,
  Length,
} from 'class-validator';
import { FACULTY_TYPE } from '../../constants';

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
    type: 'string',
    example: 'ACS',
  })
  @IsString()
  @IsNotEmpty()
  public area: string;

  @ApiModelProperty({
    example: 'EPS (0.5 FTE SEAS)',
  })
  @IsOptional()
  @IsString()
  public jointWith?: string;

  @ApiModelProperty({
    example: 'Prefers classroom near Maxwell-Dworkin',
  })
  @IsOptional()
  @IsString()
  public notes?: string;
}
