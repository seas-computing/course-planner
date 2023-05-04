import { ApiProperty } from '@nestjs/swagger';

export abstract class ActiveParentCourses {
  @ApiProperty({
    example: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
  })
  public id: string;

  @ApiProperty({
    example: 'AC 209a',
  })
  public catalogNumber: string;
}
