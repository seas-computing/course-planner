import { strictEqual } from 'assert';
import {
  noLongerActiveAbsence,
  parentalLeaveAbsence,
  presentAbsence,
  researchLeaveAbsence,
  sabbaticalAbsence,
  sabbaticalEligibleAbsence,
  sabbaticalIneligibleAbsence,
  teachingReliefAbsence,
} from 'common/__tests__/data/absence';
import { TEXT_VARIANT } from 'mark-one';
import { absenceToVariant } from '../absenceToVariant';

describe('Instructor Filter Function', function () {
  context('when absence type is ABSENCE_TYPE.PARENTAL_LEAVE', function () {
    it('should return the negative text variant', function () {
      strictEqual(
        absenceToVariant(parentalLeaveAbsence),
        TEXT_VARIANT.NEGATIVE
      );
    });
  });
  context('when absence type is ABSENCE_TYPE.RESEARCH_LEAVE', function () {
    it('should return the negative text variant', function () {
      strictEqual(
        absenceToVariant(researchLeaveAbsence),
        TEXT_VARIANT.NEGATIVE
      );
    });
  });
  context('when absence type is ABSENCE_TYPE.NO_LONGER_ACTIVE', function () {
    it('should return the medium text variant', function () {
      strictEqual(
        absenceToVariant(noLongerActiveAbsence),
        TEXT_VARIANT.MEDIUM
      );
    });
  });
  context('when absence type is ABSENCE_TYPE.SABBATICAL', function () {
    it('should return the base text variant', function () {
      strictEqual(
        absenceToVariant(sabbaticalAbsence),
        TEXT_VARIANT.BASE
      );
    });
  });
  context('when absence type is ABSENCE_TYPE.SABBATICAL_ELIGIBLE', function () {
    it('should return the base text variant', function () {
      strictEqual(
        absenceToVariant(sabbaticalEligibleAbsence),
        TEXT_VARIANT.BASE
      );
    });
  });
  context('when absence type is ABSENCE_TYPE.SABBATICAL_INELIGIBLE', function () {
    it('should return the base text variant', function () {
      strictEqual(
        absenceToVariant(sabbaticalIneligibleAbsence),
        TEXT_VARIANT.BASE
      );
    });
  });
  context('when absence type is ABSENCE_TYPE.TEACHING_RELIEF', function () {
    it('should return the base text variant', function () {
      strictEqual(
        absenceToVariant(teachingReliefAbsence),
        TEXT_VARIANT.BASE
      );
    });
  });
  context('when absence type is ABSENCE_TYPE.PRESENT', function () {
    it('should return the base text variant', function () {
      strictEqual(
        absenceToVariant(presentAbsence),
        TEXT_VARIANT.BASE
      );
    });
  });
});
