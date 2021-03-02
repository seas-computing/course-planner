import { validate } from 'class-validator';
import { strictEqual, deepStrictEqual } from 'assert';
import IsOccurringAfter from '../IsOccurringAfter';

const timeBefore = '01:01:01-05';
const timeAfter = '02:02:02-05';

describe('IsOccurringAfter', function () {
  class TimeStamps {
    public startTime: string;

    @IsOccurringAfter('startTime')
    public endTime: string;
  }
  let testCase: TimeStamps;
  context('When the endTime is after the startTime', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = timeBefore;
      testCase.endTime = timeAfter;
    });
    it('Should not generate any validation errors', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 0);
    });
  });
  context('When the endTime is before the startTime', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = timeAfter;
      testCase.endTime = timeBefore;
    });
    it('Should generate a validation error', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 1);
      const [{ constraints }] = errors;
      deepStrictEqual(Object.keys(constraints), ['isOccurringAfter']);
    });
  });
  context('When the endTime is the same as the startTime', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = timeBefore;
      testCase.endTime = timeBefore;
    });
    it('Should generate a validation error', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 1);
      const [{ constraints }] = errors;
      deepStrictEqual(Object.keys(constraints), ['isOccurringAfter']);
    });
  });
  context('When the startTime is not a valid time', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = 'foo';
      testCase.endTime = timeAfter;
    });
    it('Should generate a validation error', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 1);
      const [{ constraints }] = errors;
      deepStrictEqual(Object.keys(constraints), ['isOccurringAfter']);
    });
  });
  context('When the startTime is not defined', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.endTime = timeAfter;
    });
    it('Should generate a validation error', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 1);
      const [{ constraints }] = errors;
      deepStrictEqual(Object.keys(constraints), ['isOccurringAfter']);
    });
  });
});
