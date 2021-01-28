import { ApiModelProperty } from '@nestjs/swagger';
import { DAY } from 'common/constants';

abstract class ScheduleEntry {
  @ApiModelProperty({
    example: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
  })
  id: string;

  @ApiModelProperty({
    example: '109A',
  })
  courseNumber: string;

  @ApiModelProperty({
    example: 'Cambridge',
  })
  campus: string;

  @ApiModelProperty({
    example: 'Maxwell Dworkin 115',
  })
  room: string;

  @ApiModelProperty({
    example: true,
  })
  isUndergraduate: boolean;
}

export abstract class ScheduleViewResponseDTO {
  @ApiModelProperty({
    example: 'CSTUE12301400FALL2020',
  })
  public id: string;

  @ApiModelProperty({
    example: 12,
  })
  public startHour: number;

  @ApiModelProperty({
    example: 30,
  })
  public startMinute: number;

  @ApiModelProperty({
    example: 14,
  })
  public endHour: number;

  @ApiModelProperty({
    example: 0,
  })
  public endMinute: number;

  @ApiModelProperty({
    example: 90,
  })
  public duration: number;

  @ApiModelProperty({
    enum: DAY,
    example: DAY.TUE,
  })
  public weekday: DAY;

  @ApiModelProperty({
    example: 'CS',
  })
  public coursePrefix: string;

  public courses: ScheduleEntry[];
}
