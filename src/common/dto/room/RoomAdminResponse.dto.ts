import { ApiProperty } from '@nestjs/swagger';

export abstract class CampusInfo {
  /**
   * The database uuid of the campus
   */
  @ApiProperty({
    type: 'string',
    example: 'a1f2651d-db94-4565-8816-b8ce9d3533ab',
  })
  public id: string;

  /**
   * The campus name
   */
  @ApiProperty({
    type: 'string',
    example: 'Allston',
  })
  public name: string;
}

export abstract class BuildingInfo {
  /**
   * The database uuid of the building
   */
  @ApiProperty({
    type: 'string',
    example: 'bf1f7364-b53a-49f6-a8e5-393b770d1ede',
  })
  public id: string;

  /**
   * The building name
   */
  @ApiProperty({
    type: 'string',
    example: 'SEC',
  })
  public name: string;

  @ApiProperty({
    type: CampusInfo,
  })
  public campus: CampusInfo;
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

  @ApiProperty({
    type: BuildingInfo,
  })
  public building: BuildingInfo;
}
