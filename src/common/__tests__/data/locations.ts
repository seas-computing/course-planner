import RoomResponse from 'common/dto/room/RoomResponse.dto';

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
 * A room response for an FAS room
 */
export const fasRoom: RoomResponse = {
  id: '7a1918d1-173c-4628-baac-cd6cf10a9b95',
  name: 'Science Center Auditorium C',
  campus: 'FAS',
  capacity: 240,
  meetingTitles: [],
};
