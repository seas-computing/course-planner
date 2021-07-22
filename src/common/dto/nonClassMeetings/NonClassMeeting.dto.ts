import {
  DAY, TERM,
} from 'common/constants';
import { ApiProperty } from '@nestjs/swagger';

abstract class Location {
  @ApiProperty({
    example: 'e77babce-1a85-4d5f-9d24-1c581b6bf6bb',
  })
  public id: string;

  @ApiProperty({
    example: 'Allston',
  })
  public campus: string;

  @ApiProperty({
    example: 'Geological Museum 105',
  })
  public name: string;
}

abstract class Meeting {
  @ApiProperty({
    example: '526ba3b-87d5-40d0-be89-b0d3b6bef5f7',
  })
  public id: string;

  @ApiProperty({
    type: 'enum',
    enum: DAY,
    example: DAY.FRI,
  })
  public day: DAY;

  @ApiProperty({
    example: '06:00 PM',
  })
  public startTime: string;

  @ApiProperty({
    example: '07:00 PM',
  })
  public endTime: string;

  @ApiProperty({ type: Location })
  public room: Location;
}

abstract class NonClassEvent {
  @ApiProperty({
    description: 'NonClassEvent ID',
    example: 'dbd48f1-8233-4770-a73c-3c034e7250a0',
  })
  public id: string;

  @ApiProperty({
    description: 'Denotes whether this NonClassEvent occurs in'
      + ` ${TERM.SPRING} or ${TERM.FALL}`,
    type: 'enum',
    enum: TERM,
    example: TERM.SPRING,
  })
  public term: TERM;

  @ApiProperty({
    type: Meeting,
    isArray: true,
  })
  public meetings: Meeting[];
}

export default abstract class NonClassMeetingResponseDTO {
  @ApiProperty({
    description: 'The area the non-class meeting belongs to',
    example: 'ACS',
  })
  public area: string;

  @ApiProperty({
    description: 'NonClassParent ID',
    example: '56a825b0-8860-4434-b843-c530a86138a1',
  })
  public id: string;

  @ApiProperty({
    description: 'The title of this non class parent',
    example: 'Reading group',
  })
  public title: string;

  @ApiProperty({
    description: 'The contact name for this non-class parent',
    example: 'James Waldo',
    nullable: true,
  })
  public contactName?: string;

  @ApiProperty({
    description: 'The contact email for this non-class parent',
    example: 'j.waldo@seas.harvard.edu',
    nullable: true,
  })
  public contactEmail?: string;

  @ApiProperty({
    description: 'The contact phone number for this non-class parent',
    example: '(123) 456-7890',
    nullable: true,
  })
  public contactPhone?: string;

  @ApiProperty({
    description: 'Any misc. notes users wish to record alongside the non class parent',
    example: 'Only occurs in odd-numbered years',
    nullable: true,
  })
  public notes?: string;

  @ApiProperty({
    description: 'Non class parent predicted enrollment size',
    example: 82,
    nullable: true,
  })
  public expectedSize?: number;

  @ApiProperty({ type: NonClassEvent })
  public spring: NonClassEvent;

  @ApiProperty({ type: NonClassEvent })
  public fall: NonClassEvent;
}
