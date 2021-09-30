import { ApiProperty } from '@nestjs/swagger';

export abstract class InstructorResponseDTO {
  @ApiProperty({
    type: 'string',
    example: 'effb8b1f-0525-42d0-bcbe-29206121d8ac',
  })
  id: string;

  @ApiProperty({
    type: 'string',
    example: 'Waldo, James',
  })
  displayName: string;

  @ApiProperty({
    type: 'string',
    example: 'Prefers Allston Campus',
  })
  notes?: string;
}
