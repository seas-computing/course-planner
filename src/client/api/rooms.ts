import RoomMeetingResponse from 'common/dto/room/RoomMeetingResponse.dto';
import RoomRequest from 'common/dto/room/RoomRequest.dto';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import request from './request';

/**
 * Retrieves all rooms in the database
 */
export const getRooms = async ():Promise<RoomResponse[]> => {
  const response = await request.get('/api/rooms/');
  return response.data as RoomResponse[];
};

/**
 * Retrieves all rooms and the meetings, if any, that are occurring during the
 * requested time period
 */
export const getRoomAvailability = async (roomInfo: RoomRequest):
Promise<RoomMeetingResponse[]> => {
  const response = await request
    .get(
      '/api/rooms/availability',
      {
        params: roomInfo,
      }
    );
  return response.data as RoomMeetingResponse[];
};

export const LocationAPI = {
  getRoomAvailability,
  getRooms,
};
