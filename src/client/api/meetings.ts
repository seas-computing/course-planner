import { MeetingResponseDTO } from 'common/dto/meeting/MeetingResponse.dto';
import { MeetingRequestDTO } from 'common/dto/meeting/MeetingRequest.dto';
import request from './request';

/**
 * Update the list of meetings associated with the courseInstance or
 * nonClassMeeting given in the first parameter, returning the saved meetings.
 *
 * The meetingList parameter will replace the existing list of meetings; any
 * existing meetings that are not included will be removed.
 */

export const updateMeetingList = async (
  parentId: string,
  meetings: MeetingRequestDTO[]
): Promise<MeetingResponseDTO[]> => {
  const response = await request.put(
    `/api/meetings/${parentId}`,
    { meetings }
  );
  return response.data as MeetingResponseDTO[];
};

export const MeetingAPI = {
  updateMeetingList,
};
