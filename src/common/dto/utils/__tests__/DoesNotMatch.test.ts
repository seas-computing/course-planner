import { validate } from 'class-validator';
import { strictEqual } from 'assert';
import { cs50Course, physicsCourse } from 'testData';
import DoesNotMatch from '../DoesNotMatch';

describe('DoesNotMatch', function () {
  class MatchingFields {
    public id: string;

    @DoesNotMatch('id')
    public sameAs: string;
  }
  context('When one field does not match the other', function () {
    let doesNotMatch: MatchingFields;
    beforeEach(function () {
      doesNotMatch = new MatchingFields();
      doesNotMatch.id = physicsCourse.id;
      doesNotMatch.sameAs = cs50Course.id;
    });
    it('Should not generate any validation errors', async function () {
      const errors = await validate(doesNotMatch);
      strictEqual(errors.length, 0);
    });
  });
  context('When one field matches the other', function () {
    let matches: MatchingFields;
    beforeEach(function () {
      matches = new MatchingFields();
      matches.id = physicsCourse.id;
      matches.sameAs = physicsCourse.id;
    });
    it('Should generate validation errors', async function () {
      const errors = await validate(matches);
      console.log(errors);
      strictEqual(errors.length, 1);
    });
  });
});
