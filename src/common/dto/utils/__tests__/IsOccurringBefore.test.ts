import { validate } from 'class-validator';
import { strictEqual, deepStrictEqual } from 'assert';
import IsOccurringBefore from '../IsOccurringBefore';

const timeBefore = '01:01:01-05';
const timeAfter = '02:02:02-05';

describe('IsOccurringBefore', function () {
  class TimeStamps {
    @IsOccurringBefore('endTime')
    public startTime: string;

    public endTime: string;
  }
  let testCase: TimeStamps;
  context('When the startTime is before the endTime', function () {
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
  context('When the startTime is after the endTime', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = timeAfter;
      testCase.endTime = timeBefore;
    });
    it('Should generate a validation error', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 1);
      const [{ constraints }] = errors;
      deepStrictEqual(Object.keys(constraints), ['isOccurringBefore']);
    });
  });
  context('When the startTime is the same as the endTime', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = timeBefore;
      testCase.endTime = timeBefore;
    });
    it('Should generate a validation error', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 1);
      const [{ constraints }] = errors;
      deepStrictEqual(Object.keys(constraints), ['isOccurringBefore']);
    });
  });
  context('When the endTime is not a valid time', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = timeAfter;
      testCase.endTime = 'foo';
    });
    it('Should generate a validation error', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 1);
      const [{ constraints }] = errors;
      deepStrictEqual(Object.keys(constraints), ['isOccurringBefore']);
    });
  });
  context('When the endTime is not defined', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = timeAfter;
    });
    it('Should generate a validation error', async function () {
      const errors = await validate(testCase);
      strictEqual(errors.length, 1);
      const [{ constraints }] = errors;
      deepStrictEqual(Object.keys(constraints), ['isOccurringBefore']);
    });
  });
});
