import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { trimString } from '../utils';

export abstract class CreateRoomRequest {
  @ApiProperty({
    type: 'string',
    example: 'Allston',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  public campus: string;

  @ApiProperty({
    type: 'string',
    example: 'Paulson Hall',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  public building: string;

  @ApiProperty({
    type: 'string',
    example: '100A',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  public name: string;

  @ApiProperty({
    type: 'number',
    example: 25,
  })
  @IsNotEmpty()
  @Min(0)
  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 0,
  }, { message: '$property must be a whole number.' })
  public capacity: number;
}
