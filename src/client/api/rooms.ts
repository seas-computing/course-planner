import { CreateRoomRequest } from 'common/dto/room/CreateRoomRequest.dto';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import RoomMeetingResponse from 'common/dto/room/RoomMeetingResponse.dto';
import RoomRequest from 'common/dto/room/RoomRequest.dto';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import UpdateRoom from 'common/dto/room/UpdateRoom.dto';
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

/**
 * Retrieves all room numbers along with their building and campus info
 */
export const getAdminRooms = async ():Promise<RoomAdminResponse[]> => {
  const response = await request.get('/api/rooms/admin');
  return response.data as RoomAdminResponse[];
};

/**
 * Creates a new room
 */
export const createRoom = async (roomInfo: CreateRoomRequest):
Promise<RoomAdminResponse> => {
  const response = await request.post('/api/rooms/', roomInfo);
  return response.data as RoomAdminResponse;
};

/**
 * Edit an existing room entry
 */
const editRoom = async (roomInfo: UpdateRoom):
Promise<RoomAdminResponse> => {
  const response = await request.put(`/api/rooms/${roomInfo.id}`, roomInfo);
  return response.data as RoomAdminResponse;
};

export const LocationAPI = {
  getRoomAvailability,
  getRooms,
  getAdminRooms,
  createRoom,
  editRoom,
};
