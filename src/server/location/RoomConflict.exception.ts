import { MeetingRequestDTO } from '../../common/dto/meeting/MeetingRequest.dto';
import { Booking } from './location.service';
import { dayEnumToString } from '../../common/constants/day';

/**
 * A custom error to be thown when a user attempts to book a meeting in a room
 * that is already booked. Returns a message that includes the titles of the
 * courses/nonClassParents that are already booked.
 */
export class RoomConflictException extends Error {
  public constructor(
    details: Partial<MeetingRequestDTO>,
    conflict: Booking
  ) {
    const { day, startTime, endTime } = details;
    super(
      `${conflict.roomName} is not available on ${dayEnumToString(day)} between ${startTime} - ${endTime}. CONFLICTS WITH: ${conflict.meetingTitles.join(', ')}`
    );
  }
}
