import { strictEqual, throws } from 'assert';
import { PGTime, MERIDIAN } from '../PGTime';

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
      it('Should show the time in nonzero-padded HH:MM AM/PM format', function () {
        strictEqual(testTime.displayTime, '3:30 PM');
      });
    });
    describe('displayHour', function () {
      it('Should show just the hour portion of the AM/PM format', function () {
        strictEqual(testTime.displayHour, '3');
      });
    });
    describe('meridian', function () {
      it('Should return just the AM/PM portion of the display time', function () {
        strictEqual(testTime.meridian, MERIDIAN.PM);
      });
    });
    describe('inputString', function () {
      it('should return a timestamp in HH:MM:ss format', function () {
        strictEqual(new PGTime('15:30:45').inputString, '15:30');
      });
    });
  });
  describe('instance methods', function () {
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
  describe('static methods', function () {
    describe('toDisplay', function () {
      context('With a null value', function () {
        it('Should return null', function () {
          strictEqual(PGTime.toDisplay(null), null);
        });
      });
      context('With an undefined value', function () {
        it('Should return null', function () {
          strictEqual(PGTime.toDisplay(undefined), null);
        });
      });
      context('With an empty string', function () {
        it('Should return null', function () {
          strictEqual(PGTime.toDisplay(''), null);
        });
      });
      context('With a valid Postgres timestamp', function () {
        it('Should return the AM/PM timestamp', function () {
          strictEqual(PGTime.toDisplay('13:30:45'), '1:30 PM');
        });
      });
    });
    describe('fromDisplay', function () {
      context('With a valid timestamp', function () {
        context('With hour, minute, second, and meridian', function () {
          context('During the midnight hour', function () {
            beforeEach(function () {
              testTime = PGTime.fromDisplay('12:10:20 AM');
            });
            it('Should set the hour to 0', function () {
              strictEqual(testTime.hour, 0);
            });
            it('Should set the minute', function () {
              strictEqual(testTime.minute, 10);
            });
            it('Should set the second', function () {
              strictEqual(testTime.second, 20);
            });
            it('Should set the millisecond to 0', function () {
              strictEqual(testTime.millisecond, 0);
            });
          });
          context('before noon', function () {
            beforeEach(function () {
              testTime = PGTime.fromDisplay('9:15:45 AM');
            });
            it('Should set the hour', function () {
              strictEqual(testTime.hour, 9);
            });
            it('Should set the minute', function () {
              strictEqual(testTime.minute, 15);
            });
            it('Should set the second', function () {
              strictEqual(testTime.second, 45);
            });
            it('Should set the millisecond to 0', function () {
              strictEqual(testTime.millisecond, 0);
            });
          });
          context('during the noon hour', function () {
            beforeEach(function () {
              testTime = PGTime.fromDisplay('12:24:48 PM');
            });
            it('Should set the hour', function () {
              strictEqual(testTime.hour, 12);
            });
            it('Should set the minute', function () {
              strictEqual(testTime.minute, 24);
            });
            it('Should set the second', function () {
              strictEqual(testTime.second, 48);
            });
            it('Should set the millisecond to 0', function () {
              strictEqual(testTime.millisecond, 0);
            });
          });
          context('after noon', function () {
            beforeEach(function () {
              testTime = PGTime.fromDisplay('4:59:59 PM');
            });
            it('Should set the hour', function () {
              strictEqual(testTime.hour, 16);
            });
            it('Should set the minute', function () {
              strictEqual(testTime.minute, 59);
            });
            it('Should set the second', function () {
              strictEqual(testTime.second, 59);
            });
            it('Should set the millisecond to 0', function () {
              strictEqual(testTime.millisecond, 0);
            });
          });
          describe('Meridian flexibility', function () {
            context('variants of AM', function () {
              it('should accept "a."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 a.').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "a"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 a').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "am"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 am').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "a.m"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 a.m').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "am."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 am.').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "a.m."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 a.m.').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "A"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 A').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "A."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 A').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "AM"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 AM').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "A.M"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 A.M').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "AM."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 AM.').meridian,
                  MERIDIAN.AM
                );
              });
              it('should accept "A.M."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 A.M.').meridian,
                  MERIDIAN.AM
                );
              });
            });
            context('variants of PM', function () {
              it('should accept "p"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 p').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "p."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 p.').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "pm"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 pm').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "p.m"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 p.m').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "pm."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 pm.').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "p.m."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 p.m.').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "P"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 P').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "P."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 P.').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "PM"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 PM').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "P.M"', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 P.M').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "PM."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 PM.').meridian,
                  MERIDIAN.PM
                );
              });
              it('should accept "P.M."', function () {
                strictEqual(
                  PGTime.fromDisplay('9:19:38 P.M.').meridian,
                  MERIDIAN.PM
                );
              });
            });
          });
        });
        context('With just hour, minute, and second', function () {
          beforeEach(function () {
            testTime = PGTime.fromDisplay('9:15:30');
          });
          it('Should assume meridian is AM', function () {
            strictEqual(testTime.meridian, MERIDIAN.AM);
          });
          it('Should set the hour', function () {
            strictEqual(testTime.hour, 9);
          });
          it('Should set the minute', function () {
            strictEqual(testTime.minute, 15);
          });
          it('Should set the second', function () {
            strictEqual(testTime.second, 30);
          });
          it('should default the millisecond to 0', function () {
            strictEqual(testTime.millisecond, 0);
          });
        });
        context('With just hour and minute and meridian', function () {
          beforeEach(function () {
            testTime = PGTime.fromDisplay('11:50 PM');
          });
          it('Should parse the meridian', function () {
            strictEqual(testTime.meridian, MERIDIAN.PM);
          });
          it('Should set the hour', function () {
            strictEqual(testTime.hour, 23);
          });
          it('Should set the minute', function () {
            strictEqual(testTime.minute, 50);
          });
          it('Should default the second to 0', function () {
            strictEqual(testTime.second, 0);
          });
          it('should default the millisecond to 0', function () {
            strictEqual(testTime.millisecond, 0);
          });
        });
        context('With just hour and minute', function () {
          beforeEach(function () {
            testTime = PGTime.fromDisplay('11:50');
          });
          it('Should assume meridian is AM', function () {
            strictEqual(testTime.meridian, MERIDIAN.AM);
          });
          it('Should set the hour', function () {
            strictEqual(testTime.hour, 11);
          });
          it('Should set the minute', function () {
            strictEqual(testTime.minute, 50);
          });
          it('Should default the second to 0', function () {
            strictEqual(testTime.second, 0);
          });
          it('should default the millisecond to 0', function () {
            strictEqual(testTime.millisecond, 0);
          });
        });
        context('With just hour and meridian', function () {
          beforeEach(function () {
            testTime = PGTime.fromDisplay('4 PM');
          });
          it('Should parse the meridian', function () {
            strictEqual(testTime.meridian, MERIDIAN.PM);
          });
          it('Should set the hour', function () {
            strictEqual(testTime.hour, 16);
          });
          it('Should default the minute to 0', function () {
            strictEqual(testTime.minute, 0);
          });
          it('Should default the second to 0', function () {
            strictEqual(testTime.second, 0);
          });
          it('should default the millisecond to 0', function () {
            strictEqual(testTime.millisecond, 0);
          });
        });
        context('With just hour', function () {
          beforeEach(function () {
            testTime = PGTime.fromDisplay('12');
          });
          it('Should assume meridian is AM', function () {
            strictEqual(testTime.meridian, MERIDIAN.AM);
          });
          it('Should set the hour', function () {
            strictEqual(testTime.hour, 0);
          });
          it('Should default the minute to 0', function () {
            strictEqual(testTime.minute, 0);
          });
          it('Should default the second to 0', function () {
            strictEqual(testTime.second, 0);
          });
          it('should default the millisecond to 0', function () {
            strictEqual(testTime.millisecond, 0);
          });
        });
      });
      context('With an invalid timestamp', function () {
        context('That includes an offset', function () {
          it('Should throw a TypeError', function () {
            throws(() => PGTime.fromDisplay('10:30:45 A.M.-05'), TypeError);
          });
        });
        context('That uses an out-of-range hour', function () {
          it('Should throw a TypeError', function () {
            throws(() => PGTime.fromDisplay('13:30:45 PM'), TypeError);
          });
        });
        context('That uses an out-of-range minute', function () {
          it('Should throw a TypeError', function () {
            throws(() => PGTime.fromDisplay('5:75:45 AM'), TypeError);
          });
        });
        context('That uses an out-of-range second', function () {
          it('Should throw a TypeError', function () {
            throws(() => PGTime.fromDisplay('3:30:75 PM'), TypeError);
          });
        });
        context('That uses a millisecond', function () {
          it('Should throw a TypeError', function () {
            throws(() => PGTime.fromDisplay('1:30:45.999 AM'), TypeError);
          });
        });
        context('That uses 24 hour time', function () {
          it('Should throw a TypeError', function () {
            throws(() => PGTime.fromDisplay('15:30:45'), TypeError);
          });
        });
        context('That is not a time at all', function () {
          it('Should throw a TypeError', function () {
            throws(() => PGTime.fromDisplay('foo'), TypeError);
          });
        });
        context('With null', function () {
          it('returns null', function () {
            strictEqual(PGTime.fromDisplay(null), null);
          });
        });
        context('With undefined', function () {
          it('returns null', function () {
            strictEqual(PGTime.fromDisplay(undefined), null);
          });
        });
        context('With an empty string', function () {
          it('returns null', function () {
            strictEqual(PGTime.fromDisplay(''), null);
          });
        });
      });
    });
  });
});
