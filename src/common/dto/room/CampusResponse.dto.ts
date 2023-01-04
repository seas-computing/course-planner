import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

abstract class RoomInfo {
  /**
   * The uuid of the room
   */
  @ApiProperty({
    example: 'acda43fe-db55-4a68-87db-b10dd9bf4a84',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * The name of the room
   */
  @ApiProperty({
    example: '101a',
  })
  @IsNotEmpty()
  name: string;

  /**
   * The maximum number of people that can occupy the room at a time
   */
  @ApiProperty({
    type: 'number',
    example: 200,
  })
  public capacity: number;
}

abstract class BuildingInfo {
  /**
   * The uuid of the building
   */
  @ApiProperty({
    example: '6ed133e9-7917-4fe7-b57f-3d1c353ec320',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * The name of the building
   */
  @ApiProperty({
    example: 'SEC',
  })
  @IsNotEmpty()
  name: string;

  /**
   * The rooms associated with this campus
   */
  @ApiProperty({
    type: RoomInfo,
  })
  rooms: RoomInfo[];
}

export abstract class CampusResponse {
  /**
   * The uuid of the campus
   */
  @ApiProperty({
    example: 'b7d903ba-e298-42fb-ba97-c06c1e278cea',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * The name of the campus
   */
  @ApiProperty({
    example: 'Cambridge',
  })
  @IsNotEmpty()
  name: string;

  /**
   * The buildings associated with this campus
   */
  @ApiProperty({
    type: BuildingInfo,
  })
  buildings: BuildingInfo[];
}
