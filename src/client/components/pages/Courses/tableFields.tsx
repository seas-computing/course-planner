import React, {
  ReactElement,
  ReactNode,
  ReactText,
  useState,
  useRef,
  useEffect,
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
  sem: TERM
): (arg0: CourseInstanceResponseDTO
  ) => ReactNode => (
  course: CourseInstanceResponseDTO
): ReactNode => {
  const semKey = sem.toLowerCase() as TermKey;
  const { [semKey]: { instructors } } = course;
  return instructors.length === 0
    ? null
    : (
      <>
        <TableCellList>
          {instructors.map(
            ({ id, displayName }): ReactElement => (
              <TableCellListItem key={id}>
                {displayName}
              </TableCellListItem>
            )
          )}
        </TableCellList>
        <BorderlessButton
          onClick={(): void => {}}
          variant={VARIANT.INFO}
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

interface LegacyEvent {
  returnValue: string;
}

/**
 * Helper function to format day, time, and room into a single list
 */

export const formatMeetings = (
  term: TERM
) => (
  course: CourseInstanceResponseDTO,
  academicYear: number
): ReactNode => {
  const semKey = term.toLowerCase() as TermKey;
  const {
    [semKey]: { meetings },
    id: courseId,
  } = course;
  const [modalVisible, setModalVisible] = useState(false);
  /**
   * Keeps track of whether the user has altered fields in the form to determine
   * whether to show a confirmation dialog on modal close
   */
  const [
    isChanged,
    setIsChanged,
  ] = useState(false);

  const confirmMessage = "You have unsaved changes. Click 'OK' to disregard changes, or 'Cancel' to continue editing.";

  useEffect(() => {
    /**
     * Checks to see if there are any unsaved changes in the modal When the user
     * refreshes the page. If there are unsaved changes, the browser displays a
     * warning message to confirm the page reload. If the user selects cancel, the
     * user can continue making changes in the modal.
     */
    const onBeforeUnload = (event: Event) => {
      if (!isChanged) return;
      event.preventDefault();
      // It's unclear whether TS will account for browser incompatibility here,
      // so we use all three methods of setting the confirmation message,
      // as detailed here:
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
      const legacyEvent = (event as unknown as LegacyEvent);
      legacyEvent.returnValue = confirmMessage;
      return confirmMessage;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  },
  [isChanged]);

  /**
   * Called when the modal is closed. If there are any unsaved changes,
   * a warning message appears, and the user must confirm discarding the unsaved
   * changes in order to close the modal. If the user selects cancel, the user
   * can continue making changes in the modal.
   */
  const onModalClose = () => {
    if (isChanged) {
      // eslint-disable-next-line no-alert
      if (window.confirm(confirmMessage)) {
        setIsChanged(false);
        setModalVisible(false);
      }
    } else {
      setModalVisible(false);
    }
  };

  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentSemester = {
    term,
    calendarYear: term === TERM.FALL ? academicYear - 1 : academicYear,
  };
  return (meetings[0] === undefined || meetings[0]?.day === null)
    ? null
    : (
      <>
        <TableCellList>
          {meetings.map(({
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
                  <div>{`${startTime}-${endTime}`}</div>
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
          id={`${courseId}-${term}-edit-meetings-button`}
          onClick={() => { setModalVisible(true); }}
          variant={VARIANT.INFO}
          forwardRef={buttonRef}
        >
          <FontAwesomeIcon icon={faEdit} />
        </BorderlessButton>
        <MeetingModal
          isVisible={modalVisible}
          isChanged={isChanged}
          currentSemester={currentSemester}
          currentCourse={course}
          onChange={() => { setIsChanged(true); }}
          onClose={() => {
            onModalClose();
            setTimeout(() => { buttonRef.current.focus(); });
          }}
          onSave={() => {}}
        />
      </>
    );
};
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
  getValue: (arg0: CourseInstanceResponseDTO, arg1?: unknown) => ReactNode;
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
