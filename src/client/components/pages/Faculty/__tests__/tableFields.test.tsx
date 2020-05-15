import { strictEqual } from 'assert';
import {
  absenceEnumToTitleCase,
  categoryEnumToTitleCase,
} from '../FacultyScheduleTable';

describe('Faculty Schedule Table Fields', function () {
  describe('helper functions', function () {
    describe('absenceEnumToTitleCase', function () {
      it('should remove the underscore(s) and capitalize the first letter of each word', function () {
        const formattedAbsence = absenceEnumToTitleCase('SABBATICAL_ELIGIBLE');
        strictEqual(formattedAbsence, 'Sabbatical Eligible');
      });
    });
    describe('categoryEnumToTitleCase', function () {
      it('should remove the underscore(s) and capitalize the first letter of each word', function () {
        const formattedCategory = categoryEnumToTitleCase('NON_SEAS_LADDER');
        strictEqual(formattedCategory, 'Non-SEAS Ladder');
      });
    });
  });
});
