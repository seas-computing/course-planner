import { CreateRoomRequest } from 'common/dto/room/CreateRoomRequest.dto';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import RoomMeetingResponse from 'common/dto/room/RoomMeetingResponse.dto';
import UpdateRoom from 'common/dto/room/UpdateRoom.dto';
import { DAY, TERM } from '../../constants';
import RoomRequest from '../../dto/room/RoomRequest.dto';

/**
 * A set of fake Room Response objects for use in testing
 */

/**
 * A room response where another course has already booked the room
 */
export const bookedRoom: RoomMeetingResponse = {
  id: '608ec29b-0e9e-4efe-87b6-73a52f098f62',
  name: 'Pierce Hall 121',
  campus: 'Cambridge',
  capacity: 120,
  meetingTitles: ['AC 209a'],
};

/**
 * A room response where multiple courses have already booked the room
 */
export const multiBookedRoom: RoomMeetingResponse = {
  id: '17fe9fe8-aaed-4757-90f4-31c38b51aa17',
  name: 'Maxwell Dworkin G125',
  campus: 'Cambridge',
  capacity: 120,
  meetingTitles: ['AC 209a', 'ES 100', 'AM 112'],
};
/**
 * A room response where the room is available
 */
export const freeRoom: RoomMeetingResponse = {
  id: 'e559c201-1913-4698-888f-91e3f13c8498',
  name: 'SEC 2121',
  campus: 'Allston',
  capacity: 65,
  meetingTitles: [],
};

/**
 * A room response for an FAS room with no meetings booked
 */
export const freeFASRoom: RoomMeetingResponse = {
  id: '7a1918d1-173c-4628-baac-cd6cf10a9b95',
  name: 'Science Center Auditorium C',
  campus: 'FAS',
  capacity: 240,
  meetingTitles: [],
};

/**
 * A room response for an FAS room with meetings booked
 */
export const bookedFASRoom: RoomMeetingResponse = {
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

/**
 * A room response object, for use in testing the room admin table
 */
export const secRoomResponse: RoomAdminResponse = {
  id: '36f876da-f152-4b62-b254-55cee104ceb4',
  name: '101A',
  capacity: 20,
  building: {
    id: '9b22ae2d-20a8-4e3d-a6ed-7096ee50cd19',
    name: 'SEC',
    campus: {
      id: '73016f1f-11d3-4a60-95a4-34f2864c9408',
      name: 'Allston',
    },
  },
};

/**
 * A room response object, for use in testing the room admin table
 */
export const oxfordRoomResponse: RoomAdminResponse = {
  id: '2d545f2e-ebc7-48d2-a7e3-59bb120233a2',
  name: '330',
  capacity: 60,
  building: {
    id: 'ec635477-d92f-4ebd-a3a1-322c899488e3',
    name: '60 Oxford Street',
    campus: {
      id: 'def023e0-d47a-4346-bdfb-bf7daed9e18d',
      name: 'Cambridge',
    },
  },
};

/**
 * A room response object, for use in testing the room admin table
 */
export const bauerRoomResponse: RoomAdminResponse = {
  id: '7298b3fb-ad0a-42aa-ba1e-62052984e1e0',
  name: 'Bauer G18 Naito Lobby',
  capacity: 100,
  building: {
    id: 'd0dbf5ae-ed8f-4b39-bcab-dd644aff4c4f',
    name: 'Bauer Laboratory',
    campus: {
      id: 'aa6099b1-8d07-478d-94ba-abd2a97c1920',
      name: 'Cambridge',
    },
  },
};

/**
 * An array of room responses, for use in testing the room admin table
 */
export const adminRoomsResponse: RoomAdminResponse[] = [
  secRoomResponse,
  oxfordRoomResponse,
  bauerRoomResponse,
];

export const createSEC555Room: CreateRoomRequest = {
  campus: 'Allston',
  building: 'SEC',
  name: '555',
  capacity: 70,
};

export const sec555RoomResponse: RoomAdminResponse = {
  id: 'c149f216-553f-421d-91e0-6bde970045f9',
  name: createSEC555Room.name,
  capacity: createSEC555Room.capacity,
  building: {
    id: '2de0aaac-dc6e-4871-acc5-7569d2a72548',
    name: createSEC555Room.building,
    campus: {
      id: 'acda43fe-db55-4a68-87db-b10dd9bf4a84',
      name: createSEC555Room.campus,
    },
  },
};

export const updateSEC555Room: UpdateRoom = {
  id: secRoomResponse.id,
  name: '555a',
  capacity: 95,
};

export const updateSECRoomResponse: RoomAdminResponse = {
  id: sec555RoomResponse.id,
  name: updateSEC555Room.name,
  capacity: updateSEC555Room.capacity,
  building: sec555RoomResponse.building,
};
