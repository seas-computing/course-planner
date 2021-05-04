import { MeetingRequestDTO } from '../../common/dto/meeting/MeetingRequest.dto';

/**
 * A custom error to be thown when a user attempts to book a meeting in a room
 * that is already booked. Returns a message that includes the titles of the
 * courses/nonClassParents that are already booked.
 */
export class RoomConflictException extends Error {
  public constructor(
    details: Partial<MeetingRequestDTO>,
    conflicts: string[]
  ) {
    const { day, startTime, endTime } = details;
    super(
      `This room is not available on ${day} between ${startTime} - ${endTime}.
       CONFLICTS WITH: ${conflicts.join(', ')}`
    );
  }
}
