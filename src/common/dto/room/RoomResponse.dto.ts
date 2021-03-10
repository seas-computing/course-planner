import { ApiModelProperty } from '@nestjs/swagger';

export default abstract class RoomResponse {
  /**
   * The database uuid of the room
   */
  @ApiModelProperty({
    type: 'string',
    example: '861f3bca-e318-4c02-976c-53d60a2c09bc',
  })
  public id: string;

  /**
   * The campus within the university where the room is located
   */
  @ApiModelProperty({
    type: 'string',
    example: 'Allston',
  })
  public campus: string;

  /**
   * The name of the building concatenated with the number of the room
   */
  @ApiModelProperty({
    type: 'string',
    example: 'Maxwell-Dworkin G125',
  })
  public name: string;

  /**
   * The maximum number of people that can occupy the room at a time
   */
  @ApiModelProperty({
    type: 'number',
    example: 200,
  })
  public capacity: number;

  /**
   * An array of course titles and non-class meeting titles whose occurrences
   * overlap with the requested times.
   *
   * If the array is empty, there are no courses or non-class meetings that
   * overlap with the requested times.
   */
  @ApiModelProperty({
    isArray: true,
    example: ['AC 209', 'Staff Meeting', 'ES 115', 'AM 218'],
  })
  public meetingTitles: string[];
}
