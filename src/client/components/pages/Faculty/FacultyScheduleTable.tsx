import React, {
  FunctionComponent,
  ReactElement,
  useContext,
} from 'react';
import {
  BaseTheme,
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  ALIGN,
  TableCell,
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from 'styled-components';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';

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

const FacultyScheduleTable: FunctionComponent<FacultyScheduleTableProps> = ({
  academicYear,
  facultySchedules,
}): ReactElement => {
  /**
   * Provides the Mark-One theme using styled component's ThemeContext
   */
  const theme: BaseTheme = useContext(ThemeContext);
  return (
    <Table>
      <col span={5} />
      <colgroup span={2} />
      <colgroup span={2} />
      <col />
      <TableHead>
        <TableRow>
          <td style={{ border: 'none' }} rowSpan={5} />
          <th colSpan={2} scope="colgroup">{`Fall ${academicYear - 1}`}</th>
          <th colSpan={2} scope="colgroup">{`Spring ${academicYear}`}</th>
          <td style={{ border: 'none' }} rowSpan={1} />
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
        {facultySchedules
          .map((faculty, facultyIndex): ReactElement<TableRowProps> => (
            <TableRow isStriped={facultyIndex % 2 === 1} key={faculty.id}>
              <TableCell
                alignment={ALIGN.CENTER}
                backgroundColor={
                  (faculty.area
                        && theme.color.area[faculty.area.toLowerCase()])
                    ? theme.color.area[faculty.area.toLowerCase()]
                    : undefined
                }
              >
                {faculty.area}
              </TableCell>
              <TableCell>{faculty.lastName}</TableCell>
              <TableCell>{faculty.firstName}</TableCell>
              <TableCell>{faculty.category}</TableCell>
              <TableCell>{faculty.jointWith}</TableCell>
              <TableCell>{faculty.fall.absence.type}</TableCell>
              <TableCell>
                {faculty.fall.courses.map((course): ReactElement => (
                  <div>
                    {course.catalogNumber}
                  </div>
                ))}
              </TableCell>
              <TableCell>{faculty.spring.absence.type}</TableCell>
              <TableCell>
                {faculty.spring.courses.map((course): ReactElement => (
                  <div>
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
};

export default FacultyScheduleTable;
