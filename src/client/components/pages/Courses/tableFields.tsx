import React, { ReactElement, ReactNode, ReactText } from 'react';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote as withNotes, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { faStickyNote as withoutNotes } from '@fortawesome/free-regular-svg-icons';
import { TERM } from 'common/constants';

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
 * Constants by which to group columns
 */
export enum COLUMN_GROUP {
  SPRING,
  FALL,
  COURSE,
  META
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
  viewColumn: string;
  /**
   * For grouping columns
   */
  columnGroup: COLUMN_GROUP;
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
    columnGroup: COLUMN_GROUP.COURSE,
    viewColumn: 'area',
    getValue: retrieveValue('area'),
  },
  {
    name: 'Course',
    key: 'catalog-number',
    columnGroup: COLUMN_GROUP.COURSE,
    viewColumn: 'catalogNumber',
    getValue: retrieveValue('catalogNumber'),
  },
  {
    name: 'Title',
    key: 'title',
    columnGroup: COLUMN_GROUP.COURSE,
    viewColumn: 'title',
    getValue: retrieveValue('title'),
  },
  {
    name: 'Same As',
    key: 'same-as',
    columnGroup: COLUMN_GROUP.COURSE,
    viewColumn: 'sameAs',
    getValue: retrieveValue('sameAs'),
  },
  {
    name: 'Is SEAS?',
    key: 'is-seas',
    columnGroup: COLUMN_GROUP.COURSE,
    viewColumn: 'isSEAS',
    getValue: retrieveValue('isSEAS'),
  },
  {
    name: 'Is Undergraduate?',
    key: 'is-undergraduate',
    columnGroup: COLUMN_GROUP.COURSE,
    viewColumn: 'isUndergraduate',
    getValue: retrieveValue('isUndergraduate'),
  },
  {
    name: 'Offered',
    key: 'offered-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'offered',
    getValue: retrieveValue('offered', TERM.FALL),
  },
  {
    name: 'Instructors',
    key: 'instructors-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'instructors',
    getValue: formatInstructors(TERM.FALL),
  },
  {
    name: 'Times',
    key: 'times-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'times',
    getValue: formatTimes(TERM.FALL),
  },
  {
    name: 'Room',
    key: 'rooms-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'rooms',
    getValue: formatRooms(TERM.FALL),
  },
  {
    name: 'Pre',
    key: 'pre-enrollment-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'enrollment',
    getValue: retrieveValue('preEnrollment', TERM.FALL),
  },
  {
    name: 'Study',
    key: 'study-card-enrollment-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'enrollment',
    getValue: retrieveValue('studyCardEnrollment', TERM.FALL),
  },
  {
    name: 'Actual',
    key: 'actual-enrollment-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'enrollment',
    getValue: retrieveValue('actualEnrollment', TERM.FALL),
  },
  {
    name: 'Offered',
    key: 'offered-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'offered',
    getValue: retrieveValue('offered', TERM.SPRING),
  },
  {
    name: 'Instructors',
    key: 'instructors-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'instructors',
    getValue: formatInstructors(TERM.SPRING),
  },
  {
    name: 'Times',
    key: 'times-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'times',
    getValue: formatTimes(TERM.SPRING),
  },
  {
    name: 'Room',
    key: 'rooms-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'rooms',
    getValue: formatRooms(TERM.SPRING),
  },
  {
    name: 'Pre',
    key: 'pre-enrollment-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'enrollment',
    getValue: retrieveValue('preEnrollment', TERM.SPRING),
  },
  {
    name: 'Study',
    key: 'study-card-enrollment-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'enrollment',
    getValue: retrieveValue('studyCardEnrollment', TERM.SPRING),
  },
  {
    name: 'Actual',
    key: 'actual-enrollment-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'enrollment',
    getValue: retrieveValue('actualEnrollment', TERM.SPRING),
  },
  {
    name: 'Notes',
    key: 'notes',
    columnGroup: COLUMN_GROUP.META,
    viewColumn: 'notes',
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
    columnGroup: COLUMN_GROUP.META,
    viewColumn: 'details',
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
