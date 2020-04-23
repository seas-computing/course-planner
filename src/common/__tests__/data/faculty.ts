import { Faculty } from 'server/faculty/faculty.entity';
import { FACULTY_TYPE } from 'common/constants';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';

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
