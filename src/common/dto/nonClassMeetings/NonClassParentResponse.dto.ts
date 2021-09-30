import { ApiProperty } from '@nestjs/swagger';
import { string } from 'testData';

/**
 * DTO class representative of the shape of data returned from [[NonClasseventController.create]]
 */
export class NonClassParentResponse {
  @ApiProperty({
    example: 'e77babce-1a85-4d5f-9d24-1c581b6bf6bb',
  })
  public id: string;

  @ApiProperty({
    example: 'Data Science Reading Group',
  })
  public title: string;

  @ApiProperty({
    example: 'Jim Waldo',
    nullable: true,
  })
  public contactName?: string;

  @ApiProperty({
    example: 'j.waldo@harvard.edu',
    nullable: true,
  })
  public contactEmail?: string;

  @ApiProperty({
    example: '(123) 456-7890',
    nullable: true,
  })
  public contactPhone?: string;

  @ApiProperty({
    example: 'Some notes',
    nullable: true,
  })
  public notes?: string;

  @ApiProperty({
    example: 'e77babce-1a85-4d5f-9d24-1c581b6bf6bb',
    nullable: true,
  })
  public expectedSize?: number;

  @ApiProperty({
    example: '2021-09-30T19:40:57.837Z',
    type: string,
  })
  public createdAt: Date;

  @ApiProperty({
    example: '2021-09-30T19:40:57.837Z',
    type: string,
  })
  public updatedAt: Date;
}
