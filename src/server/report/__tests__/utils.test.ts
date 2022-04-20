import { strictEqual } from 'assert';
import { DAY } from 'common/constants';
import { formatMeetingForReport } from '../utils';

describe('Report Formatting Utils', function () {
  describe('formatMeetingForReport', function () {
    context('Meeting with a room', function () {
      const meetingWithRoom = {
        day: DAY.MON,
        startTime: '10:00:00',
        endTime: '12:00:00',
        room: {
          campus: 'Cambridge',
          name: 'Sanders Theater',
        },
      };
      it('Should include the day, start/end times, and room ', function () {
        const result = formatMeetingForReport(meetingWithRoom);
        strictEqual(
          result,
          'Monday 10:00 AM - 12:00 PM (Sanders Theater)'
        );
      });
    });
    context('Meeting without a room', function () {
      const meetingWithoutARoom = {
        day: DAY.FRI,
        startTime: '14:00:00',
        endTime: '16:00:00',
        room: null,
      };
      it('Should include the day, start/end times', function () {
        const result = formatMeetingForReport(meetingWithoutARoom);
        strictEqual(
          result,
          'Friday 2:00 PM - 4:00 PM'
        );
      });
    });
  });
});
