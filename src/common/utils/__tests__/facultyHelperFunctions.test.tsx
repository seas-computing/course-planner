import { strictEqual } from 'assert';
import {
  absenceEnumToTitleCase,
  absenceTitleCaseToEnum,
  facultyTypeEnumToTitleCase,
} from 'common/utils/facultyHelperFunctions';
import {
  FACULTY_TYPE,
  ABSENCE_TYPE,
} from 'common/constants';

describe('Faculty Helper Functions', function () {
  describe('absenceEnumToTitleCase', function () {
    it('should remove the underscore(s) and capitalize the first letter of each word', function () {
      const absence = absenceEnumToTitleCase(ABSENCE_TYPE.SABBATICAL_ELIGIBLE);
      strictEqual(absence, 'Sabbatical Eligible');
    });
  });
  describe('absenceTitleCaseToEnum', function () {
    it('converts "Sabbatical" to SABBATICAL enum value', function () {
      strictEqual(
        absenceTitleCaseToEnum('Sabbatical'),
        ABSENCE_TYPE.SABBATICAL
      );
    });
    it('converts "Sabbatical Eligible" to SABBATICAL_ELIGIBLE enum value', function () {
      strictEqual(
        absenceTitleCaseToEnum('Sabbatical Eligible'),
        ABSENCE_TYPE.SABBATICAL_ELIGIBLE
      );
    });
    it('converts "Sabbatical Ineligible" to SABBATICAL_INELIGIBLE enum value', function () {
      strictEqual(
        absenceTitleCaseToEnum('Sabbatical Ineligible'),
        ABSENCE_TYPE.SABBATICAL_INELIGIBLE
      );
    });
    it('converts "Teaching Relief" to TEACHING_RELIEF enum value', function () {
      strictEqual(
        absenceTitleCaseToEnum('Teaching Relief'),
        ABSENCE_TYPE.TEACHING_RELIEF
      );
    });
    it('converts "Research Leave" to RESEARCH_LEAVE enum value', function () {
      strictEqual(
        absenceTitleCaseToEnum('Research Leave'),
        ABSENCE_TYPE.RESEARCH_LEAVE
      );
    });
    it('converts "Parental Leave" to PARENTAL_LEAVE enum value', function () {
      strictEqual(
        absenceTitleCaseToEnum('Parental Leave'),
        ABSENCE_TYPE.PARENTAL_LEAVE
      );
    });
    it('converts "No Longer Active" to NO_LONGER_ACTIVE enum value', function () {
      strictEqual(
        absenceTitleCaseToEnum('No Longer Active'),
        ABSENCE_TYPE.NO_LONGER_ACTIVE
      );
    });
    it('converts "Present" to PRESENT enum value', function () {
      strictEqual(
        absenceTitleCaseToEnum('Present'),
        ABSENCE_TYPE.PRESENT
      );
    });
  });
  describe('facultyTypeEnumToTitleCase', function () {
    it('convert NON_SEAS_LADDER enum value to Non-SEAS Ladder', function () {
      strictEqual(
        facultyTypeEnumToTitleCase(FACULTY_TYPE.NON_SEAS_LADDER),
        'Non-SEAS Ladder'
      );
    });
    it('convert NON_LADDER enum value to Non-Ladder', function () {
      strictEqual(
        facultyTypeEnumToTitleCase(FACULTY_TYPE.NON_LADDER),
        'Non-Ladder'
      );
    });
    it('convert LADDER enum value to Ladder', function () {
      strictEqual(
        facultyTypeEnumToTitleCase(FACULTY_TYPE.LADDER),
        'Ladder'
      );
    });
  });
});
