import React, {
  FunctionComponent,
  ReactElement,
  Ref,
  useState,
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
  TableCellList,
  TableCellListItem,
  VALIGN,
} from 'mark-one';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import {
  FacultyAbsence,
  FacultyResponseDTO,
} from 'common/dto/faculty/FacultyResponse.dto';
import {
  ABSENCE_TYPE,
  getAreaColor,
  TERM,
} from 'common/constants';
import {
  absenceEnumToTitleCase,
  facultyTypeEnumToTitleCase,
} from 'common/utils/facultyHelperFunctions';
import { CellLayout } from 'client/components/general';
import { absenceToVariant } from '../utils/absenceToVariant';

interface FacultyScheduleTableProps {
  /**
   * The academic year of the faculty schedule data being displayed
   */
  academicYear: number;
  /**
   * The faculty schedules to be displayed in the table
   */
  facultySchedules: FacultyResponseDTO[];
  /**
   * The faculty schedule and absence information needed to edit a
   * faculty absence entry
   */
  onEdit: (FacultyResponseDTO, AbsenceResponseDTO) => void;
  /**
   * The ref value of the edit faculty absence button
   */
  editButtonRef: Ref<HTMLButtonElement>;
}

/**
 * Computes the id of the button for the absence being edited
 */
const computeEditAbsenceButtonId = (faculty: FacultyResponseDTO, term: TERM):
string => `editAbsence${faculty.id}${term}`;

/**
 * Component representing the Faculty Schedules for a given academic year
 */
const FacultyScheduleTable: FunctionComponent<FacultyScheduleTableProps> = ({
  academicYear,
  facultySchedules,
  onEdit,
  editButtonRef,
}): ReactElement => {
  /**
   * Keeps track of which edit absence button was clicked to determine which
   * button should regain focus when edit absence modal is closed
   */
  const [
    editedAbsence,
    setEditedAbsence,
  ] = useState<FacultyAbsence>(null);
  return (
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
              <TableCell>
                {facultyTypeEnumToTitleCase(faculty.category)}
              </TableCell>
              <TableCell>{faculty.jointWith}</TableCell>
              <TableCell
                variant={absenceToVariant(faculty.fall.absence)}
                verticalAlignment={VALIGN.TOP}
              >
                <CellLayout>
                  <TableCellList>
                    <TableCellListItem>
                      {absenceEnumToTitleCase(
                        faculty.fall.absence
                          && faculty.fall.absence.type
                          !== ABSENCE_TYPE.PRESENT
                          ? faculty.fall.absence.type
                          : ''
                      )}
                    </TableCellListItem>
                  </TableCellList>
                  <BorderlessButton
                    id={computeEditAbsenceButtonId(faculty, TERM.FALL)}
                    variant={VARIANT.INFO}
                    onClick={
                      (): void => {
                        onEdit(faculty, faculty.fall.absence);
                        setEditedAbsence(faculty.fall.absence);
                      }
                    }
                    forwardRef={
                      editedAbsence
                          && faculty.fall.absence
                          && editedAbsence.id === faculty.fall.absence.id
                        ? editButtonRef
                        : null
                    }
                    alt="edit faculty fall absence"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </BorderlessButton>
                </CellLayout>
              </TableCell>
              <TableCell variant={absenceToVariant(faculty.fall.absence)}>
                {faculty.fall.courses.map((course): ReactElement => (
                  <div key={course.id}>
                    {course.catalogNumber}
                  </div>
                ))}
              </TableCell>
              <TableCell
                variant={absenceToVariant(faculty.spring.absence)}
                verticalAlignment={VALIGN.TOP}
              >
                <CellLayout>
                  <TableCellList>
                    <TableCellListItem>
                      {absenceEnumToTitleCase(
                        faculty.spring.absence
                          && faculty.spring.absence.type
                          !== ABSENCE_TYPE.PRESENT
                          ? faculty.spring.absence.type
                          : ''
                      )}
                    </TableCellListItem>
                  </TableCellList>
                  <BorderlessButton
                    id={computeEditAbsenceButtonId(faculty, TERM.SPRING)}
                    variant={VARIANT.INFO}
                    onClick={
                      (): void => {
                        onEdit(faculty, faculty.spring.absence);
                        setEditedAbsence(faculty.spring.absence);
                      }
                    }
                    forwardRef={
                      editedAbsence
                          && faculty.spring.absence
                          && editedAbsence.id === faculty.spring.absence.id
                        ? editButtonRef
                        : null
                    }
                    alt="edit faculty spring absence"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </BorderlessButton>
                </CellLayout>
              </TableCell>
              <TableCell variant={absenceToVariant(faculty.spring.absence)}>
                {faculty.spring.courses.map((course): ReactElement => (
                  <div key={course.id}>
                    {course.catalogNumber}
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default FacultyScheduleTable;
