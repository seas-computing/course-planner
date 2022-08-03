import RoomRequest from 'common/dto/room/RoomRequest.dto';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import request from './request';

export const getRooms = async ():Promise<RoomResponse[]> => {
  const response = await request.get('/api/rooms/');
  return response.data as RoomResponse[];
};

/**
 * Retrieves all rooms and the meetings, if any, that are occurring during the
 * requested time period
 */
export const getRoomAvailability = async (roomInfo: RoomRequest):
Promise<RoomResponse[]> => {
  const response = await request
    .get(
      '/api/rooms/availability',
      {
        params: roomInfo,
      }
    );
  return response.data as RoomResponse[];
};

export const LocationAPI = {
  getRoomAvailability,
  getRooms,
};
