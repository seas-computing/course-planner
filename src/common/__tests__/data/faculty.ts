import { Faculty } from 'server/faculty/faculty.entity';
import { ABSENCE_TYPE, FACULTY_TYPE } from 'common/constants';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { CreateFacultyDTO } from 'common/dto/faculty/CreateFaculty.dto';
import { Area } from 'server/area/area.entity';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';
import { AbsenceRequestDTO } from 'common/dto/faculty/AbsenceRequest.dto';

/**
 * An example [[Faculty]] entry representing an applied math faculty member
 */
export const appliedMathFacultyMember = Object.assign(new Faculty(), {
  id: '01ac81d4-9644-4d6b-9daa-022b26903130',
  area: Object.assign(new Area(), {
    id: 'ee5d2d73-801e-44a2-8e89-45942bf2de43',
    name: 'AM',
  }),
  firstName: 'Susan',
  lastName: 'Lee',
  HUID: '90132717',
  jointWith: 'PHYS (0.5 FTE SEAS)',
  notes: 'Prefers Allston campus',
  category: FACULTY_TYPE.LADDER,
});

/**
 * An example request to create an applied math faculty member
 */
export const appliedMathFacultyMemberRequest: CreateFacultyDTO = {
  firstName: appliedMathFacultyMember.firstName,
  lastName: appliedMathFacultyMember.lastName,
  HUID: appliedMathFacultyMember.HUID,
  jointWith: appliedMathFacultyMember.jointWith,
  notes: appliedMathFacultyMember.notes,
  category: appliedMathFacultyMember.category,
  area: appliedMathFacultyMember.area.name,
};

/**
 * An example [[Faculty]] entry representing an bio engineering faculty member
 */
export const bioengineeringFacultyMember = Object.assign(new Faculty(), {
  id: '38ae66ec-7589-4948-8e21-41d142db4d3b',
  area: 'BE',
  firstName: 'Amanda',
  lastName: 'Su',
  HUID: '50602117',
  category: FACULTY_TYPE.LADDER,
});

/**
 * An example [[CreateFacultyDTO]] representing an applied physics faculty member
 */
export const newAppliedPhysicsFacultyMember: CreateFacultyDTO = {
  HUID: '41297905',
  firstName: 'Sam',
  lastName: 'Conwell',
  category: FACULTY_TYPE.NON_LADDER,
  area: 'AP',
};

/**
 * An example [[ManageFacultyResponseDTO]] response representing an applied math
 * faculty member
 */
export const appliedMathFacultyMemberResponse: ManageFacultyResponseDTO = {
  ...appliedMathFacultyMember,
  area: {
    ...appliedMathFacultyMember.area,
  },
};

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
 * An [[ManageFacultyResponseDTO]] response representing a physics faculty
 * member
 */
export const anotherPhysicsFacultyMemberResponse: ManageFacultyResponseDTO = {
  id: '1f31a245-e069-407c-a8f5-449245e6a18e',
  area: {
    id: '140bd70d-08e2-4164-ab8e-29934f315760',
    name: 'AP',
  },
  firstName: 'Michelle',
  lastName: 'Kenney',
  HUID: '84938288',
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
 * An example [[CreateFacultyDTO]] representing a faculty member in a new area
 */
export const newAreaFacultyMemberRequest: CreateFacultyDTO = {
  area: 'NA',
  firstName: 'Jessie',
  lastName: 'Lawson',
  HUID: '80598351',
  category: FACULTY_TYPE.NON_SEAS_LADDER,
  jointWith: 'AM 110',
  notes: 'Prefers Cambridge campus',
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
  jointWith: 'AM 110',
  notes: 'Prefers Cambridge campus',
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
    id: '677143a4-314f-4d85-aac7-e446b9bf5eca',
    academicYear: 2021,
    courses: [
      {
        id: '37b66373-5000-43f2-9c14-8c2426273785',
        catalogNumber: 'AM 10',
        sameAs: 'BE 100',
      },
      {
        id: '6cfaf5af-d2bc-4959-81cc-9f87bf38f9d3',
        catalogNumber: 'AM 20',
        sameAs: '',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.PRESENT,
    },
  },
  spring: {
    id: 'cc6b661b-b423-4da7-9248-88a56e070905',
    academicYear: 2021,
    courses: [
      {
        id: '37b66373-5000-43f2-9c14-8c2426273785',
        catalogNumber: 'AM 10',
        sameAs: 'BE 100',
      },
    ],
    absence: {
      id: '8db77575-7f0a-4c5e-9126-c46c5c99ac33',
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
    id: 'cc6b661b-b423-4da7-9248-88a56e070905',
    academicYear: 2021,
    courses: [
      {
        id: '22225da5-5213-4787-b819-955f554eca4e',
        catalogNumber: 'EE 100',
        sameAs: '',
      },
      {
        id: '05d04a88-8db2-46fe-8b87-aa70244ad655',
        catalogNumber: 'EE 20',
        sameAs: '',
      },
      {
        id: 'bbc7492a-71b2-489b-a9ec-a0a052c4f5c8',
        catalogNumber: 'EE 210',
        sameAs: '',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
    },
  },
  spring: {
    id: 'a2b0c918-04ea-4629-8e43-5a1b9f02ea6b',
    academicYear: 2021,
    courses: [
      {
        id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
        catalogNumber: 'EE 204',
        sameAs: '',
      },
      {
        id: '73d1ee13-8b05-46d9-86fc-9e86442f94bd',
        catalogNumber: 'EE 130',
        sameAs: '',
      },
      {
        id: 'bbc7492a-71b2-489b-a9ec-a0a052c4f5c8',
        catalogNumber: 'EE 210',
        sameAs: '',
      },
      {
        id: 'c6d3e613-fc0e-4ad4-91d3-7396dbb364f8',
        catalogNumber: 'EE 300',
        sameAs: '',
      },
    ],
    absence: {
      id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
      type: ABSENCE_TYPE.PRESENT,
    },
  },
};

/**
 * An example [[FacultyResponseDTO]] response representing a schedule of a
 * computer science faculty member
 */

export const computerScienceFacultyScheduleResponse:
FacultyResponseDTO = {
  id: '6a0af269-3128-48b9-ac33-22f3dea36b31',
  firstName: 'David',
  lastName: 'Malan',
  category: FACULTY_TYPE.LADDER,
  area: 'CS',
  jointWith: '',
  fall: {
    id: 'f13c95ba-ea08-421a-9597-4152bb8ae69a',
    academicYear: 2021,
    courses: [
      {
        id: '92abefb7-d0b3-4ec0-b4a4-9050867aa927',
        catalogNumber: 'CS 50',
        sameAs: '',
      },
    ],
    absence: {
      id: '32dea373-1c18-4eab-bf93-b0482f8c843d',
      type: ABSENCE_TYPE.PRESENT,
    },
  },
  spring: {
    id: 'e92eea2d-543c-4988-a68f-3e7ca82d306d',
    academicYear: 2021,
    courses: [
      {
        id: 'bbb0d395-3176-4752-b08d-1af1e20d1c21',
        catalogNumber: 'CS 226',
        sameAs: '',
      },
    ],
    absence: {
      id: '1efd670a-f05e-49d4-8c9f-119c4f298f73',
      type: ABSENCE_TYPE.PRESENT,
    },
  },
};

/**
 * An example [[FacultyResponseDTO]] response representing a schedule of a non
 * Active Applied ComputationalScience
 */

export const notActiveACSFacultyScheduleResponse: FacultyResponseDTO = {
  id: 'adacda77-0941-48de-8128-24f92787b2ae',
  firstName: 'Schutt',
  lastName: 'Rachel',
  category: FACULTY_TYPE.NON_LADDER,
  area: 'ACS',
  jointWith: '',
  fall: {
    id: '74f52c12-5fc2-40b3-9c8d-dfb62252346a',
    academicYear: 2020,
    courses: [
      {
        id: 'bbc7492a-5fc2-40b3-9c8d-a0a052c4f5c8',
        catalogNumber: 'ACS 21',
        sameAs: '',
      },
    ],
    absence: {
      id: '007fa61c-6824-449d-b56d-02400a94553e',
      type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
    },
  },
  spring: {
    id: 'd7fc148d-54c5-484f-bf6c-532850ca4eda',
    academicYear: 2021,
    courses: [
      {
        id: 'caa6382b-54c5-484f-bf6c-a0a052c4f5c8',
        catalogNumber: 'ACS 33',
        sameAs: '',
      },
    ],
    absence: {
      id: '0604e7d5-2230-4bf2-8cb5-a8066ff78072',
      type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
    },
  },
};

/**
 * An example [[FacultyResponseDTO]] response representing a schedule of a partially
 * Active Applied ComputationalScience
 */

export const partiallyActiveAMFacultyScheduleResponse: FacultyResponseDTO = {
  id: '594df85e-46c1-422e-b17b-72ea0cb354a2',
  firstName: '"Elizabeth"',
  lastName: 'Chen',
  category: FACULTY_TYPE.NON_LADDER,
  area: 'AM',
  jointWith: '',
  fall: {
    id: '74f52c12-5fc2-40b3-9c8d-dfb62252346a',
    academicYear: 2020,
    courses: [
      {
        id: 'bbc7492a-5fc2-40b3-9c8d-a0a052c4f5c8',
        catalogNumber: 'AM 45',
        sameAs: 'CS 107, BE 102',
      },
    ],
    absence: {
      id: 'c31f48c9-f26c-4c44-8724-abbaf1e93452',
      type: ABSENCE_TYPE.PRESENT,
    },
  },
  spring: {
    id: 'd7fc148d-54c5-484f-bf6c-532850ca4eda',
    academicYear: 2021,
    courses: [
      {
        id: 'caa6382b-54c5-484f-bf6c-a0a052c4f5c8',
        catalogNumber: 'AM 23',
        sameAs: '',
      },
    ],
    absence: {
      id: '09553d71-527e-4b71-8a45-abbf01e94a32',
      type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
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
    id: 'a2b0c918-04ea-4629-8e43-5a1b9f02ea6b',
    academicYear: 2021,
    courses: [
      {
        id: '37b66373-5000-43f2-9c14-8c2426273785',
        catalogNumber: 'NA 100',
        sameAs: '',
      },
      {
        id: '6cfaf5af-d2bc-4959-81cc-9f87bf38f9d3',
        catalogNumber: 'NA 210',
        sameAs: '',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
    },
  },
  spring: {
    id: '677143a4-314f-4d85-aac7-e446b9bf5eca',
    academicYear: 2021,
    courses: [
      {
        id: '37b66373-5000-43f2-9c14-8c2426273785',
        catalogNumber: 'NA 310',
        sameAs: '',
      },
    ],
    absence: {
      id: 'e8a7f24e-d6d0-4c9d-bfb6-89d070d21091',
      type: ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
    },
  },
};

export const facultyAbsenceResponse: AbsenceResponseDTO = {
  id: 'a2b0c918-04ea-4629-8e43-5a1b9f02ea6b',
  type: ABSENCE_TYPE.RESEARCH_LEAVE,
};

export const facultyAbsenceRequest: AbsenceRequestDTO = {
  id: 'a2b0c918-04ea-4629-8e43-5a1b9f02ea6b',
  type: ABSENCE_TYPE.SABBATICAL,
};
