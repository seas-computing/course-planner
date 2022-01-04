import React, {
  ReactElement,
  ReactNode,
  ReactText,
  Ref,
} from 'react';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  BorderlessButton,
  TableCellList,
  TableCellListItem,
  VARIANT,
  fromTheme,
  Dropdown,
} from 'mark-one';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote as withNotes, faFolderOpen, faEdit } from '@fortawesome/free-solid-svg-icons';
import { faStickyNote as withoutNotes } from '@fortawesome/free-regular-svg-icons';
import {
  TERM,
  COURSE_TABLE_COLUMN,
  COURSE_TABLE_COLUMN_GROUP,
  OFFERED,
  IS_SEAS,
  isSEASEnumToString,
} from 'common/constants';
import { CampusIcon } from 'client/components/general';
import { dayEnumToString } from 'common/constants/day';
import { offeredEnumToString } from 'common/constants/offered';
import { TermKey } from 'common/constants/term';
import styled from 'styled-components';
import { PGTime } from '../../../../common/utils/PGTime';
import { instructorDisplayNameToFirstLast } from '../utils/instructorDisplayNameToFirstLast';
import { FilterOptions, FilterState } from './filters.d';

/**
 * A component that applies styling for text that indicates the faculty has
 * no associated notes
 */
const StyledFacultyNote = styled.span`
 font-style: italic;
`;

/**
 * Simple helper function that takes a property name and optionally a semester
 * and returns a function that accepts a Course object, then returns the value
 * associated with the property/semester.property.
 *
 * This is mainly a way to simplify the looping logic required in the
 * CourseInstanceList
 */

export const retrieveValue = (
  prop: keyof CourseInstanceResponseDTO
  | keyof CourseInstanceResponseDTO[TermKey],
  sem?: TERM
): (arg0: CourseInstanceResponseDTO
  ) => ReactNode => (
  course: CourseInstanceResponseDTO
): ReactText => {
  let rawValue: ReactText;
  if (sem) {
    const semKey = sem.toLowerCase() as TermKey;
    if (semKey in course && prop in course[semKey]) {
      rawValue = course[semKey][prop] as ReactText;
    }
  } else if (prop && prop in course) {
    rawValue = course[prop] as ReactText;
  }
  if (typeof rawValue === 'boolean') {
    return rawValue ? 'Yes' : 'No';
  }
  if (rawValue in OFFERED) {
    return offeredEnumToString(rawValue as OFFERED);
  }
  if (rawValue in IS_SEAS) {
    return isSEASEnumToString(rawValue as IS_SEAS);
  }
  return rawValue;
};

/**
 * Helper function that returns a function that will format a course's
 * instructors into a list
 */

export const formatInstructors = (
  term: TERM
) => (
  course: CourseInstanceResponseDTO,
  {
    openInstructorModal,
    buttonRef,
    modalButtonId,
  }: ValueGetterOptions
): ReactNode => {
  const semKey = term.toLowerCase() as TermKey;
  const {
    id: parentId,
    catalogNumber,
    [semKey]: instance,
  } = course;
  const { calendarYear, instructors } = instance;
  return (
    <>
      <TableCellList>
        {instructors.length === 0
          ? null
          : instructors.map(
            ({ id, displayName }): ReactElement => (
              <TableCellListItem key={id}>
                {displayName}
              </TableCellListItem>
            )
          )}
      </TableCellList>
      <BorderlessButton
        alt={`Edit instructors for ${catalogNumber}, ${term} ${calendarYear}`}
        id={`${parentId}-${term}-edit-instructors-button`}
        onClick={() => {
          openInstructorModal(course, term);
        }}
        variant={VARIANT.INFO}
        forwardRef={`instructors-${parentId}-${term}` === modalButtonId ? buttonRef : null}
      >
        <FontAwesomeIcon icon={faEdit} />
      </BorderlessButton>
    </>
  );
};

/**
 * Utility component to style the data about a meeting
 */
export const MeetingGrid = styled.div`
  display: grid;
  grid-template-areas: "time campus room";
  grid-template-columns: 2fr 2em 3fr 2em;
  column-gap: ${fromTheme('ws', 'xsmall')};
  align-items: baseline;
`;

/**
 * Handles the placement of a single piece of the meeting data
 */

export const MeetingGridSection = styled.div<{area: string}>`
  grid-area: ${({ area }): string => area};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

/**
 * Helper function to format faculty notes
 */
export const formatFacultyNotes = (
  term: TERM,
  course: CourseInstanceResponseDTO
): ReactElement => {
  const semKey = term.toLowerCase() as TermKey;
  const {
    [semKey]: instance,
  } = course;
  return (
    <>
      <h3>
        Faculty Notes
      </h3>
      <div>
        {instance.instructors.map((instructor) => (
          <div key={instructor.displayName}>
            <h4>
              {instructorDisplayNameToFirstLast(
                instructor.displayName
              )}
            </h4>
            <p>
              {
                !instructor.notes
                  ? <StyledFacultyNote>No Notes</StyledFacultyNote>
                  : instructor.notes
              }
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * Helper function to format day, time, and room into a single list
 */

export const formatMeetings = (
  term: TERM
) => (
  course: CourseInstanceResponseDTO,
  {
    openMeetingModal,
    buttonRef,
    modalButtonId,
  }: ValueGetterOptions
): ReactNode => {
  const semKey = term.toLowerCase() as TermKey;
  const {
    [semKey]: instance,
    id: parentId,
    catalogNumber,
  } = course;
  const { calendarYear, meetings } = instance;
  return (
    <>
      <TableCellList>
        {(meetings[0] !== undefined && meetings[0]?.day !== null)
        && meetings.map(({
          id,
          room,
          day,
          startTime,
          endTime,
        }): ReactElement => (
          <TableCellListItem key={id}>
            <MeetingGrid>
              <MeetingGridSection area="time">
                <div>{dayEnumToString(day)}</div>
                <div>{`${PGTime.toDisplay(startTime)} - ${PGTime.toDisplay(endTime)}`}</div>
              </MeetingGridSection>
              {room && (
                <>
                  <MeetingGridSection area="room">
                    {room.name}
                  </MeetingGridSection>
                  <MeetingGridSection area="campus">
                    <CampusIcon>{room.campus}</CampusIcon>
                  </MeetingGridSection>
                </>
              )}
            </MeetingGrid>
          </TableCellListItem>
        ))}
      </TableCellList>
      <BorderlessButton
        id={`${parentId}-${term}-edit-meetings-button`}
        alt={`Edit meetings for ${catalogNumber} in ${semKey} ${calendarYear}`}
        onClick={() => {
          openMeetingModal(course, term);
        }}
        variant={VARIANT.INFO}
        // Set the ref only if this button was clicked to open the modal
        forwardRef={`meetings-${parentId}-${term}` === modalButtonId ? buttonRef : null}
      >
        <FontAwesomeIcon icon={faEdit} />
      </BorderlessButton>
    </>
  );
};

/**
 * Descibes the additional options passed into the getValue function
 */
export interface ValueGetterOptions {
  /**
   * Controls the opening of the meeting modal with the requested course and term
   */
  openMeetingModal?: (course: CourseInstanceResponseDTO, term: TERM) => void;
  /**
   * Controls the opening of the instructor modal with the requested course and term
   */
  openInstructorModal?: (course: CourseInstanceResponseDTO, term: TERM) => void;
  /**
   * The current ref value of the focused button
   */
  buttonRef?: Ref<HTMLButtonElement>;
  /**
   * The id of the edit button corresponding to the currently opened modal
   */
  modalButtonId?: string;
}

/**
 * Describes the columns in the CourseInstanceList
 */

export interface CourseInstanceListColumn {
  /**
   * The name that should appear in the heading column
   */
  name: string;
  /**
   * A unique key for the react loop
   */
  key: string;
  /**
   * The name of the column as it appears in the [[View]] entity
   */
  viewColumn: COURSE_TABLE_COLUMN;
  /**
   * For grouping columns
   */
  columnGroup: COURSE_TABLE_COLUMN_GROUP;
  /**
   * A function that will retrieve the appropriate data to appear in the cell
   */
  getValue: (
    arg0: CourseInstanceResponseDTO,
    arg1?: ValueGetterOptions
  ) => ReactNode;
  getFilter?: (
    filters: FilterState,
    genericFilterUpdate: (field: string, value: string) => void,
    filterOptions: Record<string, {value: string, label: string}[]>
  ) => ReactElement;
}

type GetterFunction = (filters: FilterState,
  genericFilterUpdate: (field: string, value: string) => void,
  filterOptions: Record<string, {value: string, label: string}[]>
) => ReactElement;

function generateDropdown<
  Field extends keyof FilterState,
  Subfield extends keyof FilterState[Field]
>(field: Field, subField?: Field extends 'spring' | 'fall' ? Subfield : never): (GetterFunction) {
  return (filters, genericFilterUpdate, filterOptions) => {
    let filterValue;
    let updateField;
    let filterOptionsField;
    if (subField) {
      updateField = `${field}.${subField.toString()}`;
      ({ [field]: { [subField]: filterValue } } = filters);
      filterOptionsField = subField;
    } else {
      updateField = field;
      ({ [field]: filterValue } = filters);
      filterOptionsField = field;
    }
    return (
      <Dropdown
        options={[{ value: 'All', label: 'All' }]
          .concat(filterOptions[filterOptionsField as FilterOptions])}
        value={filterValue as string}
        name={field}
        id={field}
        label={subField
          ? `The table will be filtered as selected in this ${field} ${subField.toString()} dropdown filter`
          : `The table will be filtered as selected in this ${field} dropdown filter`}
        isLabelVisible={false}
        hideError
        onChange={(evt) => {
          genericFilterUpdate(
            updateField,
            (evt.target as HTMLSelectElement)?.value
          );
        }}
      />
    );
  };
}

/**
 * An array of objects that define the data in the [[CourseInstanceList]], and
 * provide a method for outputting it in the correct format.
 */

export const tableFields: CourseInstanceListColumn[] = [
  {
    name: 'Area',
    key: 'area',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.AREA,
    getValue: retrieveValue('area'),
    getFilter: generateDropdown('area'),
  },
  {
    name: 'Course',
    key: 'catalog-number',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.CATALOG_NUMBER,
    getValue: retrieveValue('catalogNumber'),
  },
  {
    name: 'Title',
    key: 'title',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.TITLE,
    getValue: retrieveValue('title'),
  },
  {
    name: 'Same As',
    key: 'same-as',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.SAME_AS,
    getValue: retrieveValue('sameAs'),
  },
  {
    name: 'Is SEAS?',
    key: 'is-seas',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.IS_SEAS,
    getValue: retrieveValue('isSEAS'),
    getFilter: generateDropdown('isSEAS'),
  },
  {
    name: 'Is Undergraduate?',
    key: 'is-undergraduate',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.IS_UNDERGRADUATE,
    getValue: retrieveValue('isUndergraduate'),
  },
  {
    name: 'Offered',
    key: 'offered-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.OFFERED,
    getValue: retrieveValue('offered', TERM.FALL),
    getFilter: generateDropdown('fall', 'offered'),
  },
  {
    name: 'Instructors',
    key: 'instructors-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.INSTRUCTORS,
    getValue: formatInstructors(TERM.FALL),
  },
  {
    name: 'Meetings',
    key: 'meetings-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.MEETINGS,
    getValue: formatMeetings(TERM.FALL),
  },
  {
    name: 'Pre',
    key: 'pre-enrollment-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
    getValue: retrieveValue('preEnrollment', TERM.FALL),
  },
  {
    name: 'Study',
    key: 'study-card-enrollment-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
    getValue: retrieveValue('studyCardEnrollment', TERM.FALL),
  },
  {
    name: 'Actual',
    key: 'actual-enrollment-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
    getValue: retrieveValue('actualEnrollment', TERM.FALL),
  },
  {
    name: 'Offered',
    key: 'offered-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.OFFERED,
    getValue: retrieveValue('offered', TERM.SPRING),
    getFilter: generateDropdown('spring', 'offered'),
  },
  {
    name: 'Instructors',
    key: 'instructors-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.INSTRUCTORS,
    getValue: formatInstructors(TERM.SPRING),
  },
  {
    name: 'Meetings',
    key: 'meetings-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.MEETINGS,
    getValue: formatMeetings(TERM.SPRING),
  },
  {
    name: 'Pre',
    key: 'pre-enrollment-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
    getValue: retrieveValue('preEnrollment', TERM.SPRING),
  },
  {
    name: 'Study',
    key: 'study-card-enrollment-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
    getValue: retrieveValue('studyCardEnrollment', TERM.SPRING),
  },
  {
    name: 'Actual',
    key: 'actual-enrollment-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
    getValue: retrieveValue('actualEnrollment', TERM.SPRING),
  },
  {
    name: 'Notes',
    key: 'notes',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.META,
    viewColumn: COURSE_TABLE_COLUMN.NOTES,
    getValue: ({ notes }: CourseInstanceResponseDTO): ReactElement => {
      const hasNotes = notes && notes.trim().length > 0;
      const titleText = hasNotes ? 'View/Edit Notes' : 'Add Notes';
      return (
        <BorderlessButton
          variant={VARIANT.INFO}
          onClick={(): void => { }}
          aria-label={titleText}
        >
          <FontAwesomeIcon
            title={titleText}
            icon={hasNotes ? withNotes : withoutNotes}
          />
        </BorderlessButton>
      );
    },
  },
  {
    name: 'Details',
    key: 'details',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.META,
    viewColumn: COURSE_TABLE_COLUMN.DETAILS,
    getValue: (): ReactElement => (
      <BorderlessButton
        variant={VARIANT.INFO}
        onClick={(): void => { }}
      >
        <FontAwesomeIcon icon={faFolderOpen} />
      </BorderlessButton>
    ),
  },
];
