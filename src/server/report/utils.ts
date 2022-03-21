import { CourseInstanceResponseMeeting } from '../../common/dto/courses/CourseInstanceResponse';
import { PGTime } from '../../common/utils/PGTime';
import { dayEnumToString } from '../../common/constants/day';

/**
 * Parse the meeting details into the appropriate format to show in the Excel
 * report, i.e. "Day hh:mm - hh:mm (room)"
 */

export const formatMeetingForReport = (
  meeting: CourseInstanceResponseMeeting
): string => {
  const {
    startTime,
    endTime,
    room,
    day,
  } = meeting;
  const startTime12H = PGTime.toDisplay(startTime);
  const endTime12H = PGTime.toDisplay(endTime);
  const fullDay = dayEnumToString(day);
  const dayTime = `${fullDay} ${startTime12H} - ${endTime12H}`;
  if (room) {
    const { name: roomName } = room;
    return `${dayTime} (${roomName})`;
  }
  return dayTime;
};

/**
 * A single defined string to use at the end of multiline fields in the Excel
 * report, i.e. meetings and isntructors
 */
export const MULTILINE_SEPARATOR = ';\n';
