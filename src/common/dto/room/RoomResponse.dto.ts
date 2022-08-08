import { ApiProperty } from '@nestjs/swagger';

export default abstract class RoomResponse {
  /**
   * The database uuid of the room
   */
  @ApiProperty({
    type: 'string',
    example: '861f3bca-e318-4c02-976c-53d60a2c09bc',
  })
  public id: string;

  /**
   * The campus within the university where the room is located
   */
  @ApiProperty({
    type: 'string',
    example: 'Allston',
  })
  public campus: string;

  /**
   * The name of the building concatenated with the number of the room
   */
  @ApiProperty({
    type: 'string',
    example: 'Maxwell-Dworkin G125',
  })
  public name: string;

  /**
   * The maximum number of people that can occupy the room at a time
   */
  @ApiProperty({
    type: 'number',
    example: 200,
  })
  public capacity: number;
}
