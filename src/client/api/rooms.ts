import RoomRequest from 'common/dto/room/RoomRequest.dto';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import request from './request';
import { PGTime } from '../../common/utils/PGTime';

/**
 * Retrieves all rooms and the meetings, if any, that are occurring during the
 * requested time period
 */
export const getRoomAvailability = async (roomInfo: RoomRequest):
Promise<RoomResponse[]> => {
  const pgStartTime = new PGTime(roomInfo.startTime);
  const pgEndTime = new PGTime(roomInfo.endTime);
  const response = await request
    .get(
      '/api/rooms',
      {
        params: {
          ...roomInfo,
          startTime: pgStartTime.toRequestString(),
          endTime: pgEndTime.toRequestString(),
        },
      }
    );
  return response.data as RoomResponse[];
};

export const LocationAPI = {
  getRoomAvailability,
};
