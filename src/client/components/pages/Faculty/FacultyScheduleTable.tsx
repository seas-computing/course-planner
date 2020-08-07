import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableHeadingSpacer,
  ALIGN,
  TableCell,
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderOpen,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { FACULTY_TYPE, getAreaColor } from 'common/constants';

interface FacultyScheduleTableProps {
  /**
   * The academic year of the faculty schedule data being displayed
   */
  academicYear: number;
  /**
   * The faculty schedules to be displayed in the table
   */
  facultySchedules: FacultyResponseDTO[];
}

/**
 * A helper function that converts the faculty absence enum into the desired
 * format for the Faculty table
 * The string is split on the hyphen and joined with a space. Only the first
 * letter of each word is capitalized.
 * (e.g. 'SABBATICAL_INELIGIBLE' becomes 'Sabbatical Ineligible')
 */
export const absenceEnumToTitleCase = function (str: string): string {
  const words = str.split('_');
  return words.map(
    (word): string => word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

/**
 * A helper function that converts the faculty category enum into the desired
 * format for the Faculty table
 */
export const categoryEnumToTitleCase = function (str: string): string {
  const result: string = {
    [FACULTY_TYPE.LADDER]: 'Ladder',
    [FACULTY_TYPE.NON_SEAS_LADDER]: 'Non-SEAS Ladder',
    [FACULTY_TYPE.NON_LADDER]: 'Non-Ladder',
  }[str];
  return result;
};

/**
 * Component representing the Faculty Schedules for a given academic year
 */
const FacultyScheduleTable: FunctionComponent<FacultyScheduleTableProps> = ({
  academicYear,
  facultySchedules,
}): ReactElement => (
  <Table>
    <colgroup>
      <col span={5} />
    </colgroup>
    <colgroup span={2} />
    <colgroup span={2} />
    <colgroup>
      <col />
    </colgroup>
    <TableHead>
      <TableRow noHighlight>
        <TableHeadingSpacer colSpan={5} />
        <TableHeadingCell
          backgroundColor="transparent"
          colSpan={2}
          scope="colgroup"
        >
          {`Fall ${academicYear - 1}`}
        </TableHeadingCell>
        <TableHeadingCell
          backgroundColor="transparent"
          colSpan={2}
          scope="colgroup"
        >
          {`Spring ${academicYear}`}
        </TableHeadingCell>
        <TableHeadingSpacer rowSpan={1} />
      </TableRow>
      <TableRow isStriped>
        <TableHeadingCell scope="col">Area</TableHeadingCell>
        <TableHeadingCell scope="col">Last Name</TableHeadingCell>
        <TableHeadingCell scope="col">First Name</TableHeadingCell>
        <TableHeadingCell scope="col">Category</TableHeadingCell>
        <TableHeadingCell scope="col">Joint With</TableHeadingCell>
        <TableHeadingCell scope="col">Sabbatical Leave</TableHeadingCell>
        <TableHeadingCell scope="col">Courses</TableHeadingCell>
        <TableHeadingCell scope="col">Sabbatical Leave</TableHeadingCell>
        <TableHeadingCell scope="col">Courses</TableHeadingCell>
        <TableHeadingCell scope="col">Detail</TableHeadingCell>
      </TableRow>
    </TableHead>
    <TableBody isScrollable>
      {facultySchedules && facultySchedules
        .map((faculty, facultyIndex): ReactElement<TableRowProps> => (
          <TableRow isStriped={facultyIndex % 2 === 1} key={faculty.id}>
            <TableCell
              alignment={ALIGN.CENTER}
              backgroundColor={getAreaColor(faculty.area)}
            >
              {faculty.area}
            </TableCell>
            <TableCell>{faculty.lastName}</TableCell>
            <TableCell>{faculty.firstName}</TableCell>
            <TableCell>{categoryEnumToTitleCase(faculty.category)}</TableCell>
            <TableCell>{faculty.jointWith}</TableCell>
            <TableCell>
              {absenceEnumToTitleCase(
                faculty.fall.absence
                  ? faculty.fall.absence.type
                  : ''
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <BorderlessButton
                  variant={VARIANT.INFO}
                  onClick={(): void => {}}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </BorderlessButton>
              </div>
            </TableCell>
            <TableCell>
              {faculty.fall.courses.map((course): ReactElement => (
                <div key={course.id}>
                  {course.catalogNumber}
                </div>
              ))}
            </TableCell>
            <TableCell>
              {absenceEnumToTitleCase(
                faculty.spring.absence
                  ? faculty.spring.absence.type
                  : ''
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <BorderlessButton
                  variant={VARIANT.INFO}
                  onClick={(): void => {}}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </BorderlessButton>
              </div>
            </TableCell>
            <TableCell>
              {faculty.spring.courses.map((course): ReactElement => (
                <div key={course.id}>
                  {course.catalogNumber}
                </div>
              ))}
            </TableCell>
            <TableCell alignment={ALIGN.CENTER}>
              <BorderlessButton
                variant={VARIANT.INFO}
                onClick={(): void => {}}
              >
                <FontAwesomeIcon icon={faFolderOpen} />
              </BorderlessButton>
            </TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>
);

export default FacultyScheduleTable;
