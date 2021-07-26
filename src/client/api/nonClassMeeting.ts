import NonClassMeetingResponseDTO from 'common/dto/nonClassMeetings/NonClassMeeting.dto';
import request from './request';

export type NonClassMeetingsApiResponse =
Record<string, NonClassMeetingResponseDTO[]>;

/**
 * Get all non-class meeting data
 */
export const getNonClassMeetings = async (acyr? :number):
Promise<NonClassMeetingsApiResponse> => {
  const response = await request.get('api/non-class-events', {
    params: {
      ...(acyr ? { acyr } : {}),
    },
  });
  return response.data as NonClassMeetingsApiResponse;
};

export const NonClassMeetingApi = {
  getNonClassMeetings,
};
