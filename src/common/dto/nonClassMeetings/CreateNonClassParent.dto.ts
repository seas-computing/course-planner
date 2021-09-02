import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export default abstract class CreateNonClassParentDTO {
  @ApiProperty({
    type: 'string',
    example: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
    description: 'Area primary key ID',
  })
  @IsUUID()
  public area: string;

  @ApiProperty({
    description: 'The title of this non class parent',
    example: 'Reading group',
  })
  public title: string;

  @ApiProperty({
    description: 'The contact name for this non-class parent',
    example: 'James Waldo',
    nullable: true,
  })
  public contactName?: string;

  @ApiProperty({
    description: 'The contact email for this non-class parent',
    example: 'j.waldo@seas.harvard.edu',
    nullable: true,
  })
  public contactEmail?: string;

  @ApiProperty({
    description: 'The contact phone number for this non-class parent',
    example: '(123) 456-7890',
    nullable: true,
  })
  public contactPhone?: string;

  @ApiProperty({
    description: 'Any misc. notes users wish to record alongside the non class parent',
    example: 'Only occurs in odd-numbered years',
    nullable: true,
  })
  public notes?: string;

  @ApiProperty({
    description: 'Non class parent predicted enrollment size',
    example: 82,
    nullable: true,
  })
  public expectedSize?: number;
}
