import { ApiModelProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  IsNumberString,
  Length,
} from 'class-validator';
import { FACULTY_TYPE } from '../../constants';

export abstract class UpdateFacultyDTO {
  @ApiModelProperty({
    example: 'df15cfff-0f6f-4769-8841-1ab8a9c335d9',
  })
  @IsUUID()
  @IsNotEmpty()
  public id: string;

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
  @IsOptional()
  @IsString()
  public firstName?: string;

  @ApiModelProperty({
    example: 'Lovelace',
  })
  @IsNotEmpty()
  public lastName: string;

  @ApiModelProperty({
    example: FACULTY_TYPE.NON_SEAS_LADDER,
    enum: FACULTY_TYPE,
  })
  @IsEnum(FACULTY_TYPE)
  public category: FACULTY_TYPE;

  @ApiModelProperty({
    example: 'AM',
  })
  @IsString()
  public area: string;

  @ApiModelProperty({
    example: 'PHYS (1 FTE SEAS)',
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
