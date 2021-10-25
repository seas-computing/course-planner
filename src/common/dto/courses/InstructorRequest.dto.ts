import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export abstract class InstructorRequestDTO {
  @ApiProperty({
    type: 'string',
    example: 'effb8b1f-0525-42d0-bcbe-29206121d8ac',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    type: 'string',
    example: 'Waldo, James',
  })
  @IsNotEmpty()
  displayName: string;
}
