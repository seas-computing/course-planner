import { strictEqual } from 'assert';
import DAY, { dayEnumToString } from '../day';

describe('dayEnumToString', function () {
  context('DAY.MON', function () {
    it('Should return "Monday"', function () {
      strictEqual(dayEnumToString(DAY.MON), 'Monday');
    });
  });
  context('DAY.TUE', function () {
    it('Should return "Tuesday"', function () {
      strictEqual(dayEnumToString(DAY.TUE), 'Tuesday');
    });
  });
  context('DAY.WED', function () {
    it('Should return "Wednesday"', function () {
      strictEqual(dayEnumToString(DAY.WED), 'Wednesday');
    });
  });
  context('DAY.THU', function () {
    it('Should return "Thursday"', function () {
      strictEqual(dayEnumToString(DAY.THU), 'Thursday');
    });
  });
  context('DAY.FRI', function () {
    it('Should return "Friday"', function () {
      strictEqual(dayEnumToString(DAY.FRI), 'Friday');
    });
  });
});
