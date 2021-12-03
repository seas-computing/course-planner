import React, {
  ReactElement,
  ReactNode,
  ReactText,
  useState,
  useRef,
  useMemo,
} from 'react';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  BorderlessButton,
  TableCellList,
  TableCellListItem,
  VARIANT,
  fromTheme,
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
import MeetingModal from './MeetingModal';
import { PGTime } from '../../../../common/utils/PGTime';
import InstructorModal from './InstructorModal';
import { instructorDisplayNameToFirstLast } from '../utils/instructorDisplayNameToFirstLast';

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
): ReactNode => {
  const determineValueText = useMemo(() => {
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
  }, [course]);
  return determineValueText;
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
    updateHandler,
  }: ValueGetterOptions
): ReactNode => {
  const semKey = term.toLowerCase() as TermKey;
  const {
    id: parentId,
    catalogNumber,
    [semKey]: instance,
  } = course;
  const { calendarYear, instructors } = instance;
  /**
   * Control the visibility of the Isntructor modal
   */
  const [modalVisible, setModalVisible] = useState(false);
  /**
   * Save a ref to the edit button so we can return focus after closing the
   * modal
   */
  const buttonRef = useRef<HTMLButtonElement>(null);
  const renderInstructorList = useMemo<ReactElement>(() => {
    const currentSemester = {
      term,
      calendarYear,
    };
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
          onClick={() => { setModalVisible(true); }}
          variant={VARIANT.INFO}
          forwardRef={buttonRef}
        >
          <FontAwesomeIcon icon={faEdit} />
        </BorderlessButton>
        <InstructorModal
          isVisible={modalVisible}
          currentSemester={currentSemester}
          currentCourse={course}
          closeModal={() => {
            setModalVisible(false);
            setTimeout(() => { buttonRef.current?.focus(); });
          }}
          onSave={(newInstructorList, message?: string) => {
            updateHandler({
              ...course,
              [semKey]: {
                ...course[semKey],
                instructors: newInstructorList,
              },
            }, message);
          }}
        />
      </>
    );
  },
  [
    instructors,
    calendarYear,
    catalogNumber,
    course,
    modalVisible,
    parentId,
    semKey,
    updateHandler,
  ]);

  return renderInstructorList;
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
    updateHandler,
  }: ValueGetterOptions
): ReactNode => {
  const semKey = term.toLowerCase() as TermKey;
  const {
    [semKey]: instance,
    id: parentId,
    catalogNumber,
  } = course;
  const { calendarYear, meetings } = instance;
  const [modalVisible, setModalVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const renderMeetingList = useMemo<ReactElement>(() => {
    const currentSemester = {
      term,
      calendarYear,
    };
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
          onClick={() => { setModalVisible(true); }}
          variant={VARIANT.INFO}
          forwardRef={buttonRef}
        >
          <FontAwesomeIcon icon={faEdit} />
        </BorderlessButton>
        <MeetingModal
          isVisible={modalVisible}
          currentSemester={currentSemester}
          currentCourse={course}
          notes={formatFacultyNotes(term, course)}
          onClose={() => {
            setModalVisible(false);
            setTimeout(() => { buttonRef.current?.focus(); });
          }}
          onSave={(newMeetingList, message?: string) => {
            updateHandler({
              ...course,
              [semKey]: {
                ...course[semKey],
                meetings: newMeetingList,
              },
            }, message);
          }}
        />
      </>
    );
  },
  [
    calendarYear,
    catalogNumber,
    course,
    meetings,
    modalVisible,
    parentId,
    semKey,
    updateHandler,
  ]);
  return renderMeetingList;
};

const formatNotes = () => ({ notes }: CourseInstanceResponseDTO): ReactNode => {
  const renderNotes = useMemo(() => {
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
  }, [notes]);
  return renderNotes;
};

const formatDetails = () => (): ReactNode => {
  const renderDetails = useMemo(() => (
    <BorderlessButton
      variant={VARIANT.INFO}
      onClick={(): void => { }}
    >
      <FontAwesomeIcon icon={faFolderOpen} />
    </BorderlessButton>
  ), []);
  return renderDetails;
};

/**
 * Descibes the additional options passed into the getValue function
 */
export interface ValueGetterOptions {
  /**
   * A handler for updating the client state of the course wihtout needing to
   * refresh data from the server
   */
  updateHandler?: (course: CourseInstanceResponseDTO, message?: string) => void;
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
    getValue: formatNotes(),

  },
  {
    name: 'Details',
    key: 'details',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.META,
    viewColumn: COURSE_TABLE_COLUMN.DETAILS,
    getValue: formatDetails(),
  },
];
