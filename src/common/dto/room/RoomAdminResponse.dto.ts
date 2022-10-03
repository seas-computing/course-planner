import { ApiProperty } from '@nestjs/swagger';

interface BuildingInfo {
  id: string;
  name: string;
  campus: {
    id: string;
    name: string;
  }
}

export default abstract class RoomAdminResponse {
  /**
   * The database uuid of the room
   */
  @ApiProperty({
    type: 'string',
    example: '861f3bca-e318-4c02-976c-53d60a2c09bc',
  })
  public id: string;

  /**
   * The room number
   */
  @ApiProperty({
    type: 'string',
    example: '125',
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

  /**
   * The building and campus name information of the room
   */
  @ApiProperty({
    example: {
      id: 'b5478231-478e-464d-b29c-45c98fa472b3',
      name: 'Maxwell Dworkin',
      campus: {
        id: '4193a3e5-5987-4083-97cf-a949c146260f',
        name: 'Cambridge',
      },
    },
    isArray: false,
  })
  public building: BuildingInfo;
}
