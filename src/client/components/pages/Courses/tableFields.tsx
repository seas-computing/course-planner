import React, {
  ReactElement,
  ReactText,
  Ref,
  FunctionComponent,
} from 'react';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  BorderlessButton,
  TableCellList,
  TableCellListItem,
  VARIANT,
  fromTheme,
  Dropdown,
  TextInput,
} from 'mark-one';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStickyNote as withNotes,
  faFolderOpen,
  faEdit,
  IconDefinition,
  faShoppingCart,
  faCalendar,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { faStickyNote as withoutNotes } from '@fortawesome/free-regular-svg-icons';
import {
  TERM,
  COURSE_TABLE_COLUMN,
  COURSE_TABLE_COLUMN_GROUP,
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
 * and returns a function component that renders the text value associated with
 * the property/semester.property.
 *
 * This is mainly a way to simplify the looping logic required in the
 * CourseInstanceList
 */

export const retrieveValue = (
  prop: keyof CourseInstanceResponseDTO
  | keyof CourseInstanceResponseDTO[TermKey],
  sem?: TERM
): FunctionComponent<FieldContentProps> => (
  { course }: FieldContentProps
) => {
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
    rawValue = rawValue ? 'Yes' : 'No';
  }
  if (rawValue in IS_SEAS) {
    rawValue = isSEASEnumToString(rawValue as IS_SEAS);
  }
  return <>{rawValue}</>;
};

/**
 * Helper function that returns a functional component that renders a course's
 * instructors into a list
 */

export const formatInstructors = (
  term: TERM
):FunctionComponent<FieldContentProps> => React.memo((
  {
    course,
    openInstructorModal,
    buttonRef,
    isEditable,
  }: FieldContentProps
): ReactElement => {
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
      {isEditable && (
        <BorderlessButton
          alt={`Edit instructors for ${catalogNumber}, ${term} ${calendarYear}`}
          id={`${parentId}-${term}-edit-instructors-button`}
          onClick={() => {
            openInstructorModal(course, term);
          }}
          variant={VARIANT.INFO}
          forwardRef={buttonRef}
        >
          <FontAwesomeIcon icon={faEdit} />
        </BorderlessButton>
      )}
    </>
  );
});

/**
 * Helper function that returns a functional component that renders a course
 * instance's offered value and an edit button
 */
const formatOffered = (
  term: TERM
):FunctionComponent<FieldContentProps> => React.memo((
  {
    course,
    openOfferedModal,
    buttonRef,
  }: FieldContentProps
): ReactElement => {
  const semKey = term.toLowerCase() as TermKey;
  const {
    id: parentId,
    catalogNumber,
    [semKey]: instance,
  } = course;
  const { calendarYear, offered } = instance;
  return (
    <>
      <span>{offeredEnumToString(offered)}</span>
      <BorderlessButton
        alt={`Edit offered value for ${catalogNumber}, ${term} ${calendarYear}`}
        id={`${parentId}-${term}-edit-instructors-button`}
        onClick={() => {
          openOfferedModal(course, term);
        }}
        variant={VARIANT.INFO}
        forwardRef={buttonRef}
      >
        <FontAwesomeIcon icon={faEdit} />
      </BorderlessButton>
    </>
  );
});

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
  if (!term || !course) {
    return null;
  }
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
 * Helper function that returns a functional component that renders the day,
 * time, and room in a single list
 */

export const formatMeetings = (
  term: TERM
): FunctionComponent<FieldContentProps> => React.memo((
  {
    course,
    openMeetingModal,
    buttonRef,
    isEditable,
  }: FieldContentProps
): ReactElement => {
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
      {isEditable && (
        <BorderlessButton
          id={`${parentId}-${term}-edit-meetings-button`}
          alt={`Edit meetings for ${catalogNumber} in ${semKey} ${calendarYear}`}
          onClick={() => {
            openMeetingModal(course, term);
          }}
          variant={VARIANT.INFO}
          forwardRef={buttonRef}
        >
          <FontAwesomeIcon icon={faEdit} />
        </BorderlessButton>
      )}
    </>
  );
});

type EnrollmentField = {
  icon: IconDefinition,
  name: string,
  count?: number,
  key: string,
};

/**
 * Helper function that returns a functional component to render enrollment
 * data in an unordered list for display in a single column
 */
export const formatEnrollment = (
  term: TERM
): FunctionComponent<FieldContentProps> => React.memo((
  { course }: FieldContentProps
): ReactElement => {
  const semKey = term.toLowerCase() as TermKey;
  const { [semKey]: instance } = course;
  const enrollmentData: EnrollmentField[] = [
    {
      name: 'Pre-enrollment',
      key: 'pre',
      count: instance.preEnrollment,
      icon: faShoppingCart,
    },
    {
      name: 'Study card enrollment',
      key: 'study',
      count: instance.studyCardEnrollment,
      icon: faCalendar,
    },
    {
      name: 'Actual enrollment',
      key: 'actual',
      count: instance.actualEnrollment,
      icon: faUsers,
    },
  ];
  return (
    <TableCellList>
      {
        enrollmentData
          .filter(({ count }) => count !== null)
          .map((item) => (
            <TableCellListItem
              key={item.key}
              title={item.name}
              aria-label={item.name}
            >
              <FontAwesomeIcon
                icon={item.icon}
                fixedWidth
              />
              {' '}
              { item.count }
            </TableCellListItem>
          ))
      }
    </TableCellList>
  );
});

/**
 * Describes the additional options passed into the FieldContent functional
 * component
 */
export interface FieldContentProps {
  /**
   * The course whose data will be rendered by FieldContent
   */
  course: CourseInstanceResponseDTO;
  /**
   * Controls the opening of the meeting modal with the requested course and term
   */
  openMeetingModal?: (course: CourseInstanceResponseDTO, term: TERM) => void;
  /**
   * Controls the opening of the instructor modal with the requested course and term
   */
  openInstructorModal?: (course: CourseInstanceResponseDTO, term: TERM) => void;

  /**
   * Controls the opening of the notes modal for the requested course
   */
  openNotesModal?: (
    course: CourseInstanceResponseDTO,
    buttonId?: string
  ) => void;

  /**
   * Controls the opening of the offered modal with the requested course and term
   */
  openOfferedModal?: (course: CourseInstanceResponseDTO, term: TERM) => void;
  /**
   * The current ref value of the focused button
   */
  buttonRef?: Ref<HTMLButtonElement>;
  /**
   * Whether the user should be able to edit the cell data
   */
  isEditable?: boolean;
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
   * A functional component that will render the appropriate data to appear in
   * the cell
   */
  FieldContent: FunctionComponent<FieldContentProps>;
  getFilter?: (
    filters: FilterState,
    genericFilterUpdate: (field: string, value: string) => void,
    filterOptions?: Record<string, {value: string, label: string}[]>
  ) => ReactElement;
}

type GetterFunction = (filters: FilterState,
  genericFilterUpdate: (field: string, value: string) => void,
  filterOptions?: Record<string, {value: string, label: string}[]>
) => ReactElement;

/**
 * A function that creates a Dropdown element, which will be used as a filter
 * field, for the field that is provided.
 */
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
        id={subField ? `${field}${subField.toString()}` : `${field}`}
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
 * A function that creates a Text Input element, which will be used as a filter
 * field, for the field that is provided.
 */
function generateTextField<
  Field extends keyof FilterState,
  Subfield extends keyof FilterState[Field]
>(field: Field, subField?: Field extends 'spring' | 'fall' ? Subfield : never): (GetterFunction) {
  return (filters, genericFilterUpdate) => {
    let filterValue;
    let updateField;
    if (subField) {
      updateField = `${field}.${subField.toString()}`;
      ({ [field]: { [subField]: filterValue } } = filters);
    } else {
      updateField = field;
      ({ [field]: filterValue } = filters);
    }
    return (
      <TextInput
        id={subField ? `${field}${subField.toString()}` : `${field}`}
        name={field}
        value={filterValue as string}
        placeholder={`Filter by ${field}`}
        label={subField
          ? `The table will be filtered as characters are typed in this ${field} ${subField.toString()} filter field`
          : `The table will be filtered as characters are typed in this ${field} filter field`}
        isLabelVisible={false}
        hideError
        onChange={(evt) => {
          genericFilterUpdate(
            updateField,
            (evt.target as HTMLInputElement)?.value
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
    FieldContent: retrieveValue('area'),
    getFilter: generateDropdown('area'),
  },
  {
    name: 'Course',
    key: 'catalog-number',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.CATALOG_NUMBER,
    FieldContent: retrieveValue('catalogNumber'),
    getFilter: generateTextField('catalogNumber'),
  },
  {
    name: 'Title',
    key: 'title',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.TITLE,
    FieldContent: retrieveValue('title'),
    getFilter: generateTextField('title'),
  },
  {
    name: 'Same As',
    key: 'same-as',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.SAME_AS,
    FieldContent: retrieveValue('sameAs'),
  },
  {
    name: 'Is SEAS?',
    key: 'is-seas',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.IS_SEAS,
    FieldContent: retrieveValue('isSEAS'),
    getFilter: generateDropdown('isSEAS'),
  },
  {
    name: 'Is Undergraduate?',
    key: 'is-undergraduate',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.IS_UNDERGRADUATE,
    FieldContent: retrieveValue('isUndergraduate'),
  },
  {
    name: 'Offered',
    key: 'offered-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.OFFERED,
    FieldContent: formatOffered(TERM.FALL),
    getFilter: generateDropdown('fall', 'offered'),
  },
  {
    name: 'Instructors',
    key: 'instructors-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.INSTRUCTORS,
    FieldContent: formatInstructors(TERM.FALL),
    getFilter: generateTextField('fall', 'instructors'),
  },
  {
    name: 'Meetings',
    key: 'meetings-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.MEETINGS,
    FieldContent: formatMeetings(TERM.FALL),
  },
  {
    name: 'Enrollment',
    key: 'enrollment-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
    FieldContent: formatEnrollment(TERM.FALL),
  },
  {
    name: 'Offered',
    key: 'offered-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.OFFERED,
    FieldContent: formatOffered(TERM.SPRING),
    getFilter: generateDropdown('spring', 'offered'),
  },
  {
    name: 'Instructors',
    key: 'instructors-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.INSTRUCTORS,
    FieldContent: formatInstructors(TERM.SPRING),
    getFilter: generateTextField('spring', 'instructors'),
  },
  {
    name: 'Meetings',
    key: 'meetings-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.MEETINGS,
    FieldContent: formatMeetings(TERM.SPRING),
  },
  {
    name: 'Enrollment',
    key: 'enrollment-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
    FieldContent: formatEnrollment(TERM.SPRING),
  },
  {
    name: 'Notes',
    key: 'notes',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.META,
    viewColumn: COURSE_TABLE_COLUMN.NOTES,
    FieldContent: ({
      course,
      openNotesModal,
      buttonRef,
    }: FieldContentProps): ReactElement => {
      const { notes } = course;
      const hasNotes = notes && notes.trim().length > 0;
      const titleText = `Open notes for ${course.catalogNumber}`;
      return (
        <BorderlessButton
          id={`notes-${course.id}`}
          variant={VARIANT.INFO}
          onClick={({ currentTarget }) => {
            openNotesModal(course, currentTarget.id);
          }}
          aria-label={titleText}
          forwardRef={buttonRef}
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
    FieldContent: (): ReactElement => (
      <BorderlessButton
        variant={VARIANT.INFO}
        onClick={(): void => { }}
      >
        <FontAwesomeIcon icon={faFolderOpen} />
      </BorderlessButton>
    ),
  },
];
