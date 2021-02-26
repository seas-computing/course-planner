import { ABSENCE_TYPE } from 'common/constants';
import { FacultyAbsence } from 'common/dto/faculty/FacultyResponse.dto';

/**
 * An example Parental Leave FacultyAbsence with an id and type
 */
export const parentalLeaveAbsence: FacultyAbsence = {
  id: '2bb45c1d-ea20-4ad1-80fc-e502e70613d1',
  type: ABSENCE_TYPE.PARENTAL_LEAVE,
};

/**
 * An example Research Leave FacultyAbsence with an id and type
 */
export const researchLeaveAbsence: FacultyAbsence = {
  id: '47a0cf09-9d4b-4cea-b2de-7afe39133770',
  type: ABSENCE_TYPE.RESEARCH_LEAVE,
};

/**
 * An example No Longer Active FacultyAbsence with an id and type
 */
export const noLongerActiveAbsence: FacultyAbsence = {
  id: '8339ef34-18af-4901-9085-7d9b741261bf',
  type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
};

/**
 * An example Sabbatical FacultyAbsence with an id and type
 */
export const sabbaticalAbsence: FacultyAbsence = {
  id: '30f57dc3-5c40-4ab4-a796-dc0516014ab2',
  type: ABSENCE_TYPE.SABBATICAL,
};

/**
 * An example Sabbatical Eligible FacultyAbsence with an id and type
 */
export const sabbaticalEligibleAbsence: FacultyAbsence = {
  id: '044d3e45-6645-45c0-b518-16e7111ca850',
  type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
};

/**
 * An example Sabbatical Ineligible FacultyAbsence with an id and type
 */
export const sabbaticalIneligibleAbsence: FacultyAbsence = {
  id: 'c2945883-b6da-4b3b-8de3-4a8030569a6c',
  type: ABSENCE_TYPE.SABBATICAL_INELIGIBLE,
};

/**
 * An example Teaching Relief FacultyAbsence with an id and type
 */
export const teachingReliefAbsence: FacultyAbsence = {
  id: 'eab7c74e-881d-469a-9f0d-7bd369889993',
  type: ABSENCE_TYPE.TEACHING_RELIEF,
};

/**
 * An example Present FacultyAbsence with an id and type
 */
export const presentAbsence: FacultyAbsence = {
  id: 'c4582348-08b4-4997-b3ff-61e8befe76b3',
  type: ABSENCE_TYPE.PRESENT,
};
