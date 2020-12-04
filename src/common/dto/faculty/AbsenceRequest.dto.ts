import { ApiModelProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ABSENCE_TYPE } from 'common/constants';

export abstract class AbsenceRequestDTO {
  @ApiModelProperty({
    type: 'string',
    example: '68e16108-4a4c-473e-b1d0-c24e44886f28',
  })
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @ApiModelProperty({
    example: ABSENCE_TYPE.PARENTAL_LEAVE,
    enum: ABSENCE_TYPE,
  })
  @IsNotEmpty()
  @IsEnum(ABSENCE_TYPE)
  public type: ABSENCE_TYPE;
}
