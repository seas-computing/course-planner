import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
  Length,
} from 'class-validator';
import { FACULTY_TYPE } from '../../constants';

export abstract class CreateFacultyDTO {
  @ApiProperty({
    example: '12345678',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(8, 8)
  public HUID: string;

  @ApiProperty({
    example: 'Samantha',
  })
  @IsOptional()
  @IsString()
  public firstName?: string;

  @ApiProperty({
    example: 'Johnston',
  })
  @IsNotEmpty()
  public lastName: string;

  @ApiProperty({
    example: FACULTY_TYPE.LADDER,
    enum: FACULTY_TYPE,
  })
  @IsEnum(FACULTY_TYPE)
  public category: FACULTY_TYPE;

  @ApiProperty({
    type: 'string',
    example: 'ACS',
  })
  @IsString()
  @IsNotEmpty()
  public area: string;

  @ApiProperty({
    example: 'EPS (0.5 FTE SEAS)',
  })
  @IsOptional()
  @IsString()
  public jointWith?: string;

  @ApiProperty({
    example: 'Prefers classroom near Maxwell-Dworkin',
  })
  @IsOptional()
  @IsString()
  public notes?: string;
}
