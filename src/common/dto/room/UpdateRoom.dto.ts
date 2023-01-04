import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { trimString } from '../utils';

export default abstract class UpdateRoom {
  @ApiProperty({
    type: 'string',
    example: 'b5478231-478e-464d-b29c-45c98fa472b3',
  })
  @IsNotEmpty()
  @IsUUID()
  public id: string;

  @ApiProperty({
    type: 'string',
    example: '155b',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(trimString)
  public name: string;

  @ApiProperty({
    type: 'number',
    example: 75,
  })
  @IsNotEmpty()
  @Min(0)
  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 0,
  }, { message: '$property must be a whole number.' })
  public capacity: number;
}
