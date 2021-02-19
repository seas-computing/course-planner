import { ABSENCE_TYPE } from 'common/constants';
import { FacultyAbsence } from 'common/dto/faculty/FacultyResponse.dto';
import { TEXT_VARIANT } from 'mark-one';

/**
 * Finds the corresponding variant of type TEXT_VARIANT corresponding to
 * the given absence
 */
export const absenceToVariant = (absence: FacultyAbsence): TEXT_VARIANT => {
  if ([ABSENCE_TYPE.PARENTAL_LEAVE, ABSENCE_TYPE.RESEARCH_LEAVE]
    .includes(absence.type)) {
    return TEXT_VARIANT.NEGATIVE;
  } if ([ABSENCE_TYPE.NO_LONGER_ACTIVE].includes(absence.type)) {
    return TEXT_VARIANT.MEDIUM;
  }
  return TEXT_VARIANT.BASE;
};

export default absenceToVariant;
