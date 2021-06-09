import { ApiProperty } from '@nestjs/swagger';
import { DAY } from 'common/constants';

abstract class ScheduleEntry {
  @ApiProperty({
    example: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
  })
  id: string;

  @ApiProperty({
    example: '109A',
  })
  courseNumber: string;

  @ApiProperty({
    example: 'Cambridge',
  })
  campus: string;

  @ApiProperty({
    example: 'Maxwell Dworkin 115',
  })
  room: string;

  @ApiProperty({
    example: true,
  })
  isUndergraduate: boolean;
}

export abstract class ScheduleViewResponseDTO {
  @ApiProperty({
    example: 'CSTUE12301400FALL2020',
  })
  public id: string;

  @ApiProperty({
    example: 12,
  })
  public startHour: number;

  @ApiProperty({
    example: 30,
  })
  public startMinute: number;

  @ApiProperty({
    example: 14,
  })
  public endHour: number;

  @ApiProperty({
    example: 0,
  })
  public endMinute: number;

  @ApiProperty({
    example: 90,
  })
  public duration: number;

  @ApiProperty({
    enum: DAY,
    example: DAY.TUE,
  })
  public weekday: DAY;

  @ApiProperty({
    example: 'CS',
  })
  public coursePrefix: string;

  public courses: ScheduleEntry[];
}
