import React, {
  FunctionComponent,
  ReactElement,
  Ref,
  useContext,
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
  Dropdown,
  TextInput,
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
  FACULTY_TYPE,
  getAreaColor,
  TERM,
} from 'common/constants';
import {
  absenceEnumToTitleCase,
  facultyTypeEnumToTitleCase,
} from 'common/utils/facultyHelperFunctions';
import { CellLayout } from 'client/components/general';
import { MetadataContext } from 'client/context/MetadataContext';
import { absenceToVariant } from '../utils/absenceToVariant';
import { deduplicateCourses } from '../utils/deduplicateCourses';

/**
 * Describes the semester specific filter(s)
 */
type SemesterFilterState = {
  absence: {
    type: string;
  };
};

/**
 * Describes the top level of filters for the Faculty page
 */
export type FacultyFilterState = {
  area: string;
  lastName: string;
  firstName: string;
  category: string;
  fall: SemesterFilterState;
  spring: SemesterFilterState;
};

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
   * A handler to update the faculty as the user changes the filters
   */
  genericFilterUpdate: (field: string, value: string) => void;
  /**
   * The current values of the table column filters
   */
  filters: FacultyFilterState;
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
  genericFilterUpdate,
  filters,
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

  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

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
      <TableHead isSticky>
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
          <TableHeadingCell scope="col" rowSpan={1}>Area</TableHeadingCell>
          <TableHeadingCell scope="col" rowSpan={1}>Last Name</TableHeadingCell>
          <TableHeadingCell scope="col" rowSpan={1}>First Name</TableHeadingCell>
          <TableHeadingCell scope="col" rowSpan={1}>Category</TableHeadingCell>
          <TableHeadingCell scope="col" rowSpan={2}>Joint With</TableHeadingCell>
          <TableHeadingCell scope="col" rowSpan={1}>Sabbatical Leave</TableHeadingCell>
          <TableHeadingCell scope="col" rowSpan={2}>Courses</TableHeadingCell>
          <TableHeadingCell scope="col" rowSpan={1}>Sabbatical Leave</TableHeadingCell>
          <TableHeadingCell scope="col" rowSpan={2}>Courses</TableHeadingCell>
        </TableRow>
        <TableRow noHighlight>
          <TableHeadingCell>
            <Dropdown
              options={
                [{ value: 'All', label: 'All' }]
                  .concat(metadata.areas.map((area) => ({
                    value: area,
                    label: area,
                  })))
              }
              value={filters.area}
              name="area-filter"
              id="area-filter"
              label="Change to filter the faculty list by area"
              isLabelVisible={false}
              hideError
              onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                genericFilterUpdate('area', event.currentTarget.value);
              }}
            />
          </TableHeadingCell>
          <TableHeadingCell>
            <TextInput
              hideError
              id="last-name-filter"
              name="last-name-filter"
              placeholder="Filter by Last Name"
              label="Change to filter the faculty list by last name"
              isLabelVisible={false}
              onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                genericFilterUpdate('lastName', event.currentTarget.value);
              }}
              value={filters.lastName}
            />
          </TableHeadingCell>
          <TableHeadingCell>
            <TextInput
              hideError
              id="first-name-filter"
              name="first-name-filter"
              placeholder="Filter by First Name"
              label="Change to filter the faculty list by first name"
              isLabelVisible={false}
              onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                genericFilterUpdate('firstName', event.currentTarget.value);
              }}
              value={filters.firstName}
            />
          </TableHeadingCell>
          <TableHeadingCell>
            <Dropdown
              options={[{ value: 'All', label: 'All' }]
                .concat(Object.values(FACULTY_TYPE)
                  .map((category):
                  {value: string; label: string} => {
                    const categoryTitle = facultyTypeEnumToTitleCase(category);
                    return {
                      value: category,
                      label: categoryTitle,
                    };
                  }))}
              value={filters.category}
              name="category-filter"
              id="category-filter"
              label="Change to filter the faculty list by category"
              isLabelVisible={false}
              hideError
              onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                genericFilterUpdate('category', event.currentTarget.value);
              }}
            />
          </TableHeadingCell>
          <TableHeadingCell>
            <Dropdown
              options={[{ value: 'All', label: 'All' }]
                .concat(Object.values(ABSENCE_TYPE)
                  .map((absence):
                  {value: string; label: string} => {
                    const absenceTitle = absenceEnumToTitleCase(absence);
                    return {
                      value: absence,
                      label: absenceTitle,
                    };
                  }))}
              value={filters.fall.absence.type}
              name="fall-absence-filter"
              id="fall-absence-filter"
              label="Change to filter the faculty list by the fall absence value"
              isLabelVisible={false}
              hideError
              onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                genericFilterUpdate('fall.absence.type', event.currentTarget.value);
              }}
            />
          </TableHeadingCell>
          <TableHeadingCell>
            <Dropdown
              options={[{ value: 'All', label: 'All' }]
                .concat(Object.values(ABSENCE_TYPE)
                  .map((absence):
                  {value: string; label: string} => {
                    const absenceTitle = absenceEnumToTitleCase(absence);
                    return {
                      value: absence,
                      label: absenceTitle,
                    };
                  }))}
              value={filters.spring.absence.type}
              name="spring-absence-filter"
              id="spring-absence-filter"
              label="Change to filter the faculty list by the spring absence value"
              isLabelVisible={false}
              hideError
              onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                genericFilterUpdate('spring.absence.type', event.currentTarget.value);
              }}
            />
          </TableHeadingCell>
        </TableRow>
      </TableHead>
      <TableBody isScrollable>
        {facultySchedules.map((faculty, facultyIndex)
        : ReactElement<TableRowProps> => (
          <TableRow isStriped={facultyIndex % 2 === 1} key={faculty.id}>
            <TableCell
              alignment={ALIGN.LEFT}
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
              {deduplicateCourses(faculty.fall.courses)
                .map((course): ReactElement => (
                  <div key={course}>
                    {course}
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
              {deduplicateCourses(faculty.spring.courses)
                .map((course): ReactElement => (
                  <div key={course}>
                    {course}
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
