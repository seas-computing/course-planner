import { strictEqual } from 'assert';
import { ABSENCE_TYPE, FACULTY_TYPE } from 'common/constants';
import {
  absenceEnumToTitleCase,
  categoryEnumToTitleCase,
} from 'common/__tests__/utils/facultyHelperFunctions';

describe('Faculty Schedule Table Fields', function () {
  describe('helper functions', function () {
    describe('absenceEnumToTitleCase', function () {
      it('should remove the underscore(s) and capitalize the first letter of each word', function () {
        const formattedAbsence = absenceEnumToTitleCase(
          ABSENCE_TYPE.SABBATICAL_ELIGIBLE
        );
        strictEqual(formattedAbsence, 'Sabbatical Eligible');
      });
    });
    describe('categoryEnumToTitleCase', function () {
      it('convert NON_SEAS_LADDER enum value to Non-SEAS Ladder', function () {
        const formattedCategory = categoryEnumToTitleCase(
          FACULTY_TYPE.NON_SEAS_LADDER
        );
        strictEqual(formattedCategory, 'Non-SEAS Ladder');
      });
      it('convert NON_LADDER enum value to Non-Ladder', function () {
        const formattedCategory = categoryEnumToTitleCase(
          FACULTY_TYPE.NON_LADDER
        );
        strictEqual(formattedCategory, 'Non-Ladder');
      });
      it('convert LADDER enum value to Ladder', function () {
        const formattedCategory = categoryEnumToTitleCase(
          FACULTY_TYPE.LADDER
        );
        strictEqual(formattedCategory, 'Ladder');
      });
    });
  });
});
