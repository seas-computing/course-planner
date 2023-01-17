import { ABSENCE_TYPE } from 'common/constants';
import { FacultyAbsence } from 'common/dto/faculty/FacultyResponse.dto';
import { TEXT_VARIANT } from 'mark-one';

/**
 * Finds the corresponding variant of type TEXT_VARIANT corresponding to
 * the given absence
 */
export const absenceToVariant = (absence: FacultyAbsence): TEXT_VARIANT => {
  if (!absence) {
    return TEXT_VARIANT.BASE;
  }
  switch (absence.type) {
    case ABSENCE_TYPE.PARENTAL_LEAVE:
    case ABSENCE_TYPE.RESEARCH_LEAVE:
      return TEXT_VARIANT.NEGATIVE;
    case ABSENCE_TYPE.NO_LONGER_ACTIVE:
      return TEXT_VARIANT.MEDIUM;
    default:
      return TEXT_VARIANT.BASE;
  }
};

export default absenceToVariant;
