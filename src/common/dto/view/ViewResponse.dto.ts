import { ApiProperty } from '@nestjs/swagger';
import { COURSE_TABLE_COLUMN } from 'common/constants';

/**
 * ViewResponse
 *
 * Defines the data shape returned by the API for operations relating to the
 * management of custom views
 */
export class ViewResponse {
  @ApiProperty({
    example: '7f8333a6-49ce-4ee5-b6f2-1c34a524bcb3',
    description: 'The primary key ID of this custom view',
  })
  public id: string;

  @ApiProperty({
    description: 'All of the columns visible in this custom view',
    example: COURSE_TABLE_COLUMN.AREA,
    enum: COURSE_TABLE_COLUMN,
  })
  public columns: COURSE_TABLE_COLUMN[] = [];

  @ApiProperty({
    example: 'No semester data',
    description: 'A descriptive name for this custom view',
  })
  public name: string;
}
