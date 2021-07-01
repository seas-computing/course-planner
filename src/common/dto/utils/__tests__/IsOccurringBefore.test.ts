import { validate } from 'class-validator';
import { strictEqual, deepStrictEqual, throws } from 'assert';
import { stub } from 'sinon';
import * as dummy from 'testData';
import IsOccurringBefore from '../IsOccurringBefore';
import { PGTime } from '../../../utils/PGTime';

const timeBefore = '01:01:01';
const timeAfter = '02:02:02';

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
  context('When there is a non-TypeError thrown', function () {
    beforeEach(function () {
      testCase = new TimeStamps();
      testCase.startTime = timeBefore;
      testCase.endTime = timeAfter;
      stub(PGTime.prototype, 'isBefore').throws(dummy.error);
    });
    it('Should throw that error', function () {
      throws(() => validate(testCase), dummy.error);
    });
  });
});
