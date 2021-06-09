import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNumberString,
  Length,
} from 'class-validator';
import { FACULTY_TYPE } from '../../constants';

export abstract class UpdateFacultyDTO {
  @ApiProperty({
    example: 'df15cfff-0f6f-4769-8841-1ab8a9c335d9',
  })
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @ApiProperty({
    example: '87654321',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(8, 8)
  public HUID: string;

  @ApiProperty({
    example: 'Ada',
  })
  @IsOptional()
  @IsString()
  public firstName?: string;

  @ApiProperty({
    example: 'Lovelace',
  })
  @IsNotEmpty()
  public lastName: string;

  @ApiProperty({
    example: FACULTY_TYPE.NON_SEAS_LADDER,
    enum: FACULTY_TYPE,
  })
  @IsEnum(FACULTY_TYPE)
  public category: FACULTY_TYPE;

  @ApiProperty({
    example: 'AM',
  })
  @IsString()
  public area: string;

  @ApiProperty({
    example: 'PHYS (1 FTE SEAS)',
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
