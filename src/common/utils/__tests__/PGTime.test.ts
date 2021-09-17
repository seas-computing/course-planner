import { strictEqual, throws } from 'assert';
import { PGTime } from '../PGTime';

describe('PGTime', function () {
  let testTime: PGTime;
  describe('constructor', function () {
    context('With a valid timestamp', function () {
      context('With hour, minutes, seconds, and milliseconds', function () {
        beforeEach(function () {
          testTime = new PGTime('15:30:45.600');
        });
        it('Should set the hour', function () {
          strictEqual(testTime.hour, 15);
        });
        it('Should set the minute', function () {
          strictEqual(testTime.minute, 30);
        });
        it('Should set the second', function () {
          strictEqual(testTime.second, 45);
        });
        it('Should set the milliseconds', function () {
          strictEqual(testTime.millisecond, 600);
        });
      });
      context('With just hour, minutes, and seconds', function () {
        beforeEach(function () {
          testTime = new PGTime('09:19:29');
        });
        it('Should set the hour', function () {
          strictEqual(testTime.hour, 9);
        });
        it('Should set the minute', function () {
          strictEqual(testTime.minute, 19);
        });
        it('Should set the second', function () {
          strictEqual(testTime.second, 29);
        });
        it('Should default the millisecond to 0', function () {
          strictEqual(testTime.millisecond, 0);
        });
      });
      context('With hour and minute', function () {
        beforeEach(function () {
          testTime = new PGTime('11:11');
        });
        it('Should set the hour', function () {
          strictEqual(testTime.hour, 11);
        });
        it('Should set the minute', function () {
          strictEqual(testTime.minute, 11);
        });
        it('Should default the second to 0', function () {
          strictEqual(testTime.second, 0);
        });
        it('Should default the millisecond to 0', function () {
          strictEqual(testTime.millisecond, 0);
        });
      });
      context('With hour', function () {
        beforeEach(function () {
          testTime = new PGTime('13');
        });
        it('Should set the hour', function () {
          strictEqual(testTime.hour, 13);
        });
        it('Should default the minute to 0', function () {
          strictEqual(testTime.minute, 0);
        });
        it('Should default to second to 0', function () {
          strictEqual(testTime.second, 0);
        });
        it('Should default the millisecond to 0', function () {
          strictEqual(testTime.millisecond, 0);
        });
      });
    });
    context('With an invalid timestamp', function () {
      context('That includes an offset', function () {
        it('Should throw a TypeError', function () {
          throws(() => new PGTime('15:30:45-05'), TypeError);
        });
      });
      context('That uses an out-of-range hour', function () {
        it('Should throw a TypeError', function () {
          throws(() => new PGTime('25:30:45'), TypeError);
        });
      });
      context('That uses an out-of-range minute', function () {
        it('Should throw a TypeError', function () {
          throws(() => new PGTime('15:75:45'), TypeError);
        });
      });
      context('That uses an out-of-range second', function () {
        it('Should throw a TypeError', function () {
          throws(() => new PGTime('15:30:75'), TypeError);
        });
      });
      context('That uses an out-of-range millisecond', function () {
        it('Should throw a TypeError', function () {
          throws(() => new PGTime('15:30:45.999999'), TypeError);
        });
      });
      context('That uses AM/PM time', function () {
        it('Should throw a TypeError', function () {
          throws(() => new PGTime('03:30:45 PM'), TypeError);
        });
      });
      context('That is not a time at all', function () {
        it('Should throw a TypeError', function () {
          throws(() => new PGTime('foo'), TypeError);
        });
      });
      context('With an empty string', function () {
        it('Should throw a TypeError', function () {
          throws(() => new PGTime(''), TypeError);
        });
      });
    });
  });
  describe('getters', function () {
    beforeEach(function () {
      testTime = new PGTime('15:30:45.600');
    });
    describe('msSinceMidnight', function () {
      it('Should count the number of milliseconds that have elapsed since midnight before', function () {
        const inDateForm = new Date(Date.UTC(1970, 0, 1, 15, 30, 45, 600));
        strictEqual(inDateForm.valueOf(), testTime.msSinceMidnight);
      });
    });
    describe('displayTime', function () {
      it('Should show the time in zero-padded HH:MM AM/PM format', function () {
        strictEqual(testTime.displayTime, '03:30 PM');
      });
    });
  });
  describe('methods', function () {
    beforeEach(function () {
      testTime = new PGTime('15:30:45');
    });
    describe('toString', function () {
      it('should return a timestamp in HH:MM:ss.mmm format', function () {
        strictEqual(new PGTime('15:30:45').toString(), '15:30:45.000');
      });
    });
    describe('isSameAs', function () {
      context('Called with an earlier time', function () {
        it('Should return false', function () {
          strictEqual(testTime.isSameAs(new PGTime('09:09:09')), false);
        });
      });
      context('Called with a matching time', function () {
        it('Should return true', function () {
          strictEqual(testTime.isSameAs(new PGTime('15:30:45')), true);
        });
      });
      context('Called with a later time', function () {
        it('Should return false', function () {
          strictEqual(testTime.isSameAs(new PGTime('17:17:17')), false);
        });
      });
    });
    describe('isBefore', function () {
      context('Called with an earlier time', function () {
        it('Should return false', function () {
          strictEqual(testTime.isBefore(new PGTime('09:09:09')), false);
        });
      });
      context('Called with a matching time', function () {
        it('Should return false', function () {
          strictEqual(testTime.isBefore(new PGTime('15:30:45')), false);
        });
      });
      context('Called with a later time', function () {
        it('Should return true', function () {
          strictEqual(testTime.isBefore(new PGTime('17:17:17')), true);
        });
      });
    });
    describe('isAfter', function () {
      context('Called with an earlier time', function () {
        it('Should return true', function () {
          strictEqual(testTime.isAfter(new PGTime('09:09:09')), true);
        });
      });
      context('Called with a matching time', function () {
        it('Should return false', function () {
          strictEqual(testTime.isAfter(new PGTime('15:30:45')), false);
        });
      });
      context('Called with a later time', function () {
        it('Should return false', function () {
          strictEqual(testTime.isAfter(new PGTime('17:17:17')), false);
        });
      });
    });
  });
});
