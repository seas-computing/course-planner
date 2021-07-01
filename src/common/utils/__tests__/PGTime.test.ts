import { strictEqual, throws } from 'assert';
import { PGTime } from '../PGTime';

describe('PGTime', function () {
  let testTime: PGTime;
  describe('constructor', function () {
    context('With a valid timestamp', function () {
      context('With milliseconds', function () {
        beforeEach(function () {
          testTime = new PGTime('15:30:45.600');
        });
        it('Sets the hour prop', function () {
          strictEqual(testTime.hour, 15);
        });
        it('Sets the minute prop', function () {
          strictEqual(testTime.minute, 30);
        });
        it('Sets the second prop', function () {
          strictEqual(testTime.second, 45);
        });
        it('Sets the milliseconds prop', function () {
          strictEqual(testTime.millisecond, 600);
        });
      });
      context('Without milliseconds', function () {
        beforeEach(function () {
          testTime = new PGTime('09:00:00');
        });
        it('Sets the hour prop', function () {
          strictEqual(testTime.hour, 9);
        });
        it('Sets the minute prop', function () {
          strictEqual(testTime.minute, 0);
        });
        it('Sets the second prop', function () {
          strictEqual(testTime.second, 0);
        });
        it('Sets the milliseconds prop to 0', function () {
          strictEqual(testTime.millisecond, 0);
        });
      });
    });
    context('With an invalid timestamp', function () {
      context('That includes an offset', function () {
        it('Throws a TypeError', function () {
          throws(() => new PGTime('15:30:45-05'), TypeError);
        });
      });
      context('That uses an out-of-range hour', function () {
        it('Throws a TypeError', function () {
          throws(() => new PGTime('25:30:45'), TypeError);
        });
      });
      context('That uses an out-of-range minute', function () {
        it('Throws a TypeError', function () {
          throws(() => new PGTime('15:75:45'), TypeError);
        });
      });
      context('That uses an out-of-range second', function () {
        it('Throws a TypeError', function () {
          throws(() => new PGTime('15:30:75'), TypeError);
        });
      });
      context('That uses an out-of-range millisecond', function () {
        it('Throws a TypeError', function () {
          throws(() => new PGTime('15:30:45.999999'), TypeError);
        });
      });
      context('That uses AM/PM time', function () {
        it('Throws a TypeError', function () {
          throws(() => new PGTime('03:30:45 PM'), TypeError);
        });
      });
      context('That is not a time at all', function () {
        it('Throws a TypeError', function () {
          throws(() => new PGTime('foo'), TypeError);
        });
      });
      context('With an empty string', function () {
        it('Throws a TypeError', function () {
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
