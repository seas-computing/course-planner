import { strictEqual } from 'assert';
import { convert12To24HourTime, convertTo12HourDisplayTime } from '../timeHelperFunctions';

describe('Time Helper Functions', function () {
  describe('convert12To24HourTime', function () {
    context('AM times', function () {
      it('should convert AM times appropriately to 24 hour time', function () {
        const originalTime = '4:32 AM';
        strictEqual(convert12To24HourTime(originalTime), `0${originalTime.split(' ')[0]}`);
      });
      it('should left pad AM times with a 0', function () {
        const nonPaddedHour = '5';
        const minutes = '45';
        const originalTime = `${nonPaddedHour}:${minutes} AM`;
        strictEqual(convert12To24HourTime(originalTime), `0${nonPaddedHour}:${minutes}`);
      });
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
  describe('convertTo12HourDisplayTime', function () {
    context('when a 12 hour time string is provided', function () {
      context('when there is a leading zero', function () {
        it('removes the leading zero from the time string', function () {
          const time = '06:13 AM';
          strictEqual(convertTo12HourDisplayTime(time), time.replace(/^0+/, ''));
        });
      });
      context('when there is no leading zero', function () {
        it('returns the time string itself', function () {
          const time = '12:00 AM';
          strictEqual(convertTo12HourDisplayTime(time), time);
        });
      });
    });
    context('when a 24 hour time string is provided', function () {
      it('converts pre-noon times appropriately', function () {
        const time = '09:24';
        // The helper function removes leading zeroes from AM times
        const [hour, minute] = time.split(':');
        strictEqual(convertTo12HourDisplayTime(time), `${parseInt(hour, 10)}:${parseInt(minute, 10)} AM`);
      });
      it('converts noon appropriately', function () {
        const time = '12:00';
        strictEqual(convertTo12HourDisplayTime(time), `${time} PM`);
      });
      it('converts midnight appropriately', function () {
        const time = '00:00';
        strictEqual(convertTo12HourDisplayTime(time), '12:00 AM');
      });
      it('converts post-noon times appropriately', function () {
        const time = '19:55';
        const [hour, minute] = time.split(':');
        strictEqual(convertTo12HourDisplayTime(time), `${parseInt(hour, 10) - 12}:${minute} PM`);
      });
    });
  });
});
