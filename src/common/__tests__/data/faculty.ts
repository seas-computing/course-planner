import { Faculty } from 'server/faculty/faculty.entity';
import { ABSENCE_TYPE, FACULTY_TYPE } from 'common/constants';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';

/**
 * An example [[Faculty]] entry representing an applied math faculty member
 */

export const appliedMathFacultyMember = Object.assign(new Faculty(), {
  id: '01ac81d4-9644-4d6b-9daa-022b26903130',
  area: {
    id: 'a035245a-9237-4346-9c8a-e8532022215d',
    name: 'AM',
  },
  firstName: 'Susan',
  lastName: 'Lee',
  HUID: '90132717',
  jointWith: 'PHYS (0.5 FTE SEAS)',
  category: FACULTY_TYPE.LADDER,
});

/**
 * An example [[Faculty]] entry representing an bio engineering faculty member
 */
export const bioengineeringFacultyMember = Object.assign(new Faculty(), {
  id: '38ae66ec-7589-4948-8e21-41d142db4d3b',
  area: {
    id: '29b70622-271b-4d1c-b70a-306e217758e9',
    name: 'BE',
  },
  firstName: 'Amanda',
  lastName: 'Su',
  HUID: '50602117',
  category: FACULTY_TYPE.LADDER,
});

/**
 * An example [[ManageFacultyResponseDTO]] response representing a physics faculty
 * member
 */
export const physicsFacultyMemberResponse: ManageFacultyResponseDTO = {
  id: '4a13c3b7-45ed-4aa9-94b7-29e70c9cd6b0',
  area: {
    id: '140bd70d-08e2-4164-ab8e-29934f315760',
    name: 'AP',
  },
  firstName: 'Sam',
  lastName: 'Conwell',
  HUID: '41297905',
  category: FACULTY_TYPE.NON_LADDER,
};

/**
 * An example [[ManageFacultyResponseDTO]] response representing a bioengineering
 * faculty member
 */
export const bioengineeringFacultyMemberResponse: ManageFacultyResponseDTO = {
  id: '38ae66ec-7589-4948-8e21-41d142db4d3b',
  area: {
    id: '29b70622-271b-4d1c-b70a-306e217758e9',
    name: 'BE',
  },
  firstName: 'Amanda',
  lastName: 'Su',
  HUID: '50602117',
  category: FACULTY_TYPE.LADDER,
};

/**
 * An example [[ManageFacultyResponseDTO]] response representing a faculty member
 * categorized under a new area
 */
export const newAreaFacultyMemberResponse: ManageFacultyResponseDTO = {
  id: 'f696d531-aef2-413f-9922-f480aa9d6039',
  area: {
    id: '26526d71-2c22-4943-a012-bb5dba7cf2a5',
    name: 'NA',
  },
  firstName: 'Jessie',
  lastName: 'Lawson',
  HUID: '80598351',
  category: FACULTY_TYPE.NON_SEAS_LADDER,
};

/**
 * An example [[FacultyResponseDTO]] response representing a schedule of an
 * applied math faculty member
 */
export const appliedMathFacultyScheduleResponse: FacultyResponseDTO = {
  id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
  firstName: 'Sean',
  lastName: 'Garrison',
  category: FACULTY_TYPE.LADDER,
  area: 'AM',
  jointWith: '',
  fall: {
    academicYear: 2021,
    courses: [
      {
        id: '37b66373-5000-43f2-9c14-8c2426273785',
        catalogNumber: 'AM 10',
      },
      {
        id: '6cfaf5af-d2bc-4959-81cc-9f87bf38f9d3',
        catalogNumber: 'AM 20',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
    },
  },
  spring: {
    academicYear: 2021,
    courses: [
      {
        id: '37b66373-5000-43f2-9c14-8c2426273785',
        catalogNumber: 'AM 10',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
    },
  },
};

/**
 * An example [[FacultyResponseDTO]] response representing a schedule of an
 * applied math faculty member
 */

export const electricalEngineeringFacultyScheduleResponse:
FacultyResponseDTO = {
  id: 'aef568df-969d-41d9-9fa5-746cbf734dce',
  firstName: 'Avi',
  lastName: 'Demler',
  category: FACULTY_TYPE.NON_LADDER,
  area: 'EE',
  jointWith: '',
  fall: {
    academicYear: 2021,
    courses: [
      {
        id: '22225da5-5213-4787-b819-955f554eca4e',
        catalogNumber: 'EE 100',
      },
      {
        id: '05d04a88-8db2-46fe-8b87-aa70244ad655',
        catalogNumber: 'EE 20',
      },
      {
        id: 'bbc7492a-71b2-489b-a9ec-a0a052c4f5c8',
        catalogNumber: 'EE 210',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
    },
  },
  spring: {
    academicYear: 2021,
    courses: [
      {
        id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
        catalogNumber: 'EE 204',
      },
      {
        id: '73d1ee13-8b05-46d9-86fc-9e86442f94bd',
        catalogNumber: 'EE 130',
      },
      {
        id: 'bbc7492a-71b2-489b-a9ec-a0a052c4f5c8',
        catalogNumber: 'EE 210',
      },
      {
        id: 'c6d3e613-fc0e-4ad4-91d3-7396dbb364f8',
        catalogNumber: 'EE 300',
      },
    ],
    absence: {
      id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
      type: ABSENCE_TYPE.SABBATICAL_INELIGIBLE,
    },
  },
};

/**
 * An example [[FacultyResponseDTO]] response representing a schedule of a
 * faculty member in an area that does not yet exist for the purpose of testing
 * that the backgroundColor prop is not passed when area does not exist
 */
export const newAreaFacultyScheduleResponse: FacultyResponseDTO = {
  id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
  firstName: 'Penelope',
  lastName: 'Watson',
  category: FACULTY_TYPE.LADDER,
  area: 'NA',
  jointWith: '',
  fall: {
    academicYear: 2021,
    courses: [
      {
        id: '37b66373-5000-43f2-9c14-8c2426273785',
        catalogNumber: 'NA 100',
      },
      {
        id: '6cfaf5af-d2bc-4959-81cc-9f87bf38f9d3',
        catalogNumber: 'NA 210',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
    },
  },
  spring: {
    academicYear: 2021,
    courses: [
      {
        id: '37b66373-5000-43f2-9c14-8c2426273785',
        catalogNumber: 'NA 310',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
    },
  },
};
