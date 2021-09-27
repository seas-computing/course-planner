import { DAY } from '../../constants';
import { MeetingRequestDTO } from '../../dto/meeting/MeetingRequest.dto';
import { MeetingResponseDTO } from '../../dto/meeting/MeetingResponse.dto';

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

export const mondayMeetingReponseWithRoom: MeetingResponseDTO = {
  id: 'd7668e5e-a2f6-4c63-b265-c981a15a170a',
  day: DAY.MON,
  startTime: '09:00:00',
  endTime: '10:30:00',
  room: {
    id: 'dc913de7-9707-4d49-a5dd-97b66e54d25e',
    name: 'Maxwell Dworkin G125',
    campus: 'Cambridge',
  },
};

export const wednesdayMeetingReponseWithoutRoom: MeetingResponseDTO = {
  id: '1ebdaad0-75a4-49b8-b2e5-f09354f9339b',
  day: DAY.WED,
  startTime: '09:00:00',
  endTime: '10:30:00',
  room: {
    id: 'dc913de7-9707-4d49-a5dd-97b66e54d25e',
    name: 'Maxwell Dworkin G125',
    campus: 'Cambridge',
  },
};
