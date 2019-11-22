import { ApiModelProperty } from '@nestjs/swagger';
import { DAY } from '../../constants';

export abstract class ScheduleViewResponseDTO {
  @ApiModelProperty({
    example: {
      hour: 12,
      minute: 0,
    },
  })
  public startTime: {
    hour: number;
    minute: number;
  };

  @ApiModelProperty({
    example: {
      hour: 13,
      minute: 30,
    },
  })
  public endTime: {
    hour: number;
    minute: number;
  };

  @ApiModelProperty({
    example: { duration: 90 },
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

  @ApiModelProperty({
    example: {
      id: 'c7b1fa3f-c5b0-478d-a29c-7f85a4d80109',
      courseNumber: '051',
      campus: 'Cambridge',
      room: 'Maxwell Dworkin 119',
      isUndergraduate: true,
    },
  })
  public courses: [
    {
      id: string;
      courseNumber: string;
      campus: string;
      room: string;
      isUndergraduate: boolean;
    }
  ]
}
