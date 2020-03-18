import { Faculty } from 'server/faculty/faculty.entity';
import { FACULTY_TYPE } from 'common/constants';
import { FacultyResponseDTO } from 'common/dto/faculty/facultyResponse.dto';

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
 * An example [[FacultyResponseDTO]] response representing a physics faculty member
 */
export const physicsFacultyMemberResponse: FacultyResponseDTO = {
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
 * An example [[FacultyResponseDTO]] response representing a bioengineering faculty member
 */
export const bioengineeringFacultyMemberResponse: FacultyResponseDTO = {
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
