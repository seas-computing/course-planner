import RoomResponse from 'common/dto/room/RoomResponse.dto';
import { DAY, TERM } from '../../constants';
import RoomRequest from '../../dto/room/RoomRequest.dto';

/**
 * A set of fake Room Response objects for use in testing
 */

/**
 * A room response where another course has already booked the room
 */
export const bookedRoom: RoomResponse = {
  id: '608ec29b-0e9e-4efe-87b6-73a52f098f62',
  name: 'Pierce Hall 121',
  campus: 'Cambridge',
  capacity: 120,
  meetingTitles: ['AC 209a'],
};

/**
 * A room response where multiple courses have already booked the room
 */
export const multiBookedRoom: RoomResponse = {
  id: '17fe9fe8-aaed-4757-90f4-31c38b51aa17',
  name: 'Maxwell Dworkin G125',
  campus: 'Cambridge',
  capacity: 120,
  meetingTitles: ['AC 209a', 'ES 100', 'AM 112'],
};
/**
 * A room response where the room is available
 */
export const freeRoom: RoomResponse = {
  id: 'e559c201-1913-4698-888f-91e3f13c8498',
  name: 'SEC 2121',
  campus: 'Allston',
  capacity: 65,
  meetingTitles: [],
};

/**
 * A room response for an FAS room with no meetings booked
 */
export const freeFASRoom: RoomResponse = {
  id: '7a1918d1-173c-4628-baac-cd6cf10a9b95',
  name: 'Science Center Auditorium C',
  campus: 'FAS',
  capacity: 240,
  meetingTitles: [],
};

/**
 * A room response for an FAS room with meetings booked
 */
export const bookedFASRoom: RoomResponse = {
  id: '6b923cb4-0215-4fa6-b7cf-db2b0b456b45',
  name: 'William James Hall B101',
  campus: 'FAS',
  capacity: 140,
  meetingTitles: ['ABCD Meeting'],
};

/**
 * A room request object, for use in testing
 */
export const roomRequest: RoomRequest = {
  day: DAY.MON,
  startTime: '13:00:00',
  endTime: '15:00:00',
  term: TERM.FALL,
  calendarYear: '2020',
};
