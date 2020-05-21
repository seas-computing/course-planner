import React, { ReactElement, ReactNode, ReactText } from 'react';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote as withNotes, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { faStickyNote as withoutNotes } from '@fortawesome/free-regular-svg-icons';
import { TERM, COURSE_TABLE_COLUMN, COURSE_TABLE_COLUMN_GROUP } from 'common/constants';

/**
 * Simple helper function that takes a property name and optionally a semester
 * and returns a function that accepts a Course object, then returns the value
 * associated with the property/semester.property.
 *
 * This is mainly a way to simplify the looping logic required in the
 * CourseInstanceList
 */

export const retrieveValue = (
  prop: string,
  sem?: TERM
): (arg0: CourseInstanceResponseDTO
  ) => ReactNode => (
  course: CourseInstanceResponseDTO
): ReactText => {
  let rawValue: ReactText;
  if (sem) {
    rawValue = course[sem.toLowerCase()][prop];
  } else {
    rawValue = course[prop];
  }
  if (typeof rawValue === 'boolean') {
    return rawValue ? 'Yes' : 'No';
  }
  if (rawValue in OFFERED) {
    return offeredEnumToString(rawValue as OFFERED);
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
  const { instructors } = course[sem.toLowerCase()];
  return instructors.length === 0
    ? null
    : (
      <ol>
        {instructors.map(
          ({ id, displayName }): ReactElement => (
            <li key={id}>
              {displayName}
            </li>
          )
        )}
      </ol>
    );
};

/**
 * Helper function to format meeting times into a list
 */

export const formatTimes = (
  sem: TERM
): (arg0: CourseInstanceResponseDTO
  ) => ReactNode => (
  course: CourseInstanceResponseDTO
): ReactNode => {
  const { meetings } = course[sem.toLowerCase()];
  return meetings[0].day === null
    ? null
    : (
      <ol>
        {meetings.map(({
          id,
          day,
          startTime,
          endTime,
        }): ReactElement => (
          <li key={id}>
            {`${day}: ${startTime}-${endTime}`}
          </li>
        ))}
      </ol>
    );
};
/**
 * Helper function to format meeting rooms into a list
 */

export const formatRooms = (
  sem: TERM
): (arg0: CourseInstanceResponseDTO
  ) => ReactNode => (
  course: CourseInstanceResponseDTO
): ReactNode => {
  const { meetings } = course[sem.toLowerCase()];
  return meetings[0].day === null
    ? null
    : (
      <ol>
        {meetings.map(({
          id,
          room: { name },
        }): ReactElement => (
          <li key={id}>
            {name}
          </li>
        ))}
      </ol>
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
  getValue: (arg0: CourseInstanceResponseDTO) => ReactNode;
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
    name: 'Times',
    key: 'times-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.TIMES,
    getValue: formatTimes(TERM.FALL),
  },
  {
    name: 'Room',
    key: 'rooms-fall',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.FALL,
    viewColumn: COURSE_TABLE_COLUMN.ROOMS,
    getValue: formatRooms(TERM.FALL),
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
    name: 'Times',
    key: 'times-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.TIMES,
    getValue: formatTimes(TERM.SPRING),
  },
  {
    name: 'Room',
    key: 'rooms-spring',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SPRING,
    viewColumn: COURSE_TABLE_COLUMN.ROOMS,
    getValue: formatRooms(TERM.SPRING),
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
    getValue: ({ notes }): ReactElement => {
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
