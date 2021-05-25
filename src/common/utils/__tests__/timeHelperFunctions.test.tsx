import { strictEqual } from 'assert';
import { convert12To24HourTime } from '../timeHelperFunctions';

describe('Time Helper Functions', function () {
  describe('convert12To24HourTime', function () {
    it('should convert AM times appropriately to 24 hour time', function () {
      const originalTime = '04:32 AM';
      strictEqual(convert12To24HourTime(originalTime), originalTime.split(' ')[0]);
    });
    it('should convert PM times appropriately to 24 hour time', function () {
      const originalTime = '07:10 PM';
      const [hour, minute] = originalTime.split(' ')[0].split(':');
      const convertedHour = (parseInt(hour, 10) + 12).toString();
      strictEqual(convert12To24HourTime(originalTime), `${convertedHour}:${minute}`);
    });
    it('should convert the hour portion of 12:00 AM to "00"', function () {
      const midnight = '12:00 AM';
      strictEqual(convert12To24HourTime(midnight).split(':')[0], '00');
    });
    it('should preserve the hour portion of 12:00 PM as "12"', function () {
      const noon = '12:00 PM';
      strictEqual(convert12To24HourTime(noon).split(':')[0], '12');
    });
  });
});
