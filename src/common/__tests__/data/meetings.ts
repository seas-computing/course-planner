import { DAY } from '../../constants';
import { MeetingRequestDTO } from '../../dto/meeting/MeetingRequest.dto';

/**
 * A collection of fake meetings to use for testing meeting behaviors
 */

export const mondayMeetingWithRoom: MeetingRequestDTO = {
  day: DAY.MON,
  startTime: '09:00:00',
  endTime: '10:30:00',
  roomId: 'dc913de7-9707-4d49-a5dd-97b66e54d25e',
};

export const mondayMeetingWithoutRoom: MeetingRequestDTO = {
  day: DAY.MON,
  startTime: '09:00:00',
  endTime: '10:30:00',
  roomId: null,
};

export const wednesdayMeetingWithRoom: MeetingRequestDTO = {
  day: DAY.WED,
  startTime: '09:00:00',
  endTime: '10:30:00',
  roomId: 'dc913de7-9707-4d49-a5dd-97b66e54d25e',
};

export const wednesdayMeetingWithoutRoom: MeetingRequestDTO = {
  day: DAY.WED,
  startTime: '09:00:00',
  endTime: '10:30:00',
  roomId: null,
};
