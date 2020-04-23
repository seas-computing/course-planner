import React, { ReactElement, ReactNode } from 'react';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';

/**
 * Simple helper function that takes a property name and optionally a semester
 * and returns a function that accepts a Course object, then returns the value
 * associated with the property/semester.property.
 *
 * This is mainly a way to simplify the looping logic requireq in the
 * CourseInstanceList
 */

const retrieveValue = (
  prop: string,
  sem?: string
): (arg0: CourseInstanceResponseDTO
  ) => ReactNode => (
    course: CourseInstanceResponseDTO
  ): string => (sem
    ? course[sem][prop]
    : course[prop]);

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
    viewColumn: 'area',
    getValue: retrieveValue('area'),
  },
  {
    name: 'Course',
    key: 'catalog-number',
    viewColumn: 'catalogNumber',
    getValue: retrieveValue('catalogNumber'),
  },
  {
    name: 'Title',
    key: 'title',
    viewColumn: 'title',
    getValue: retrieveValue('title'),
  },
  {
    name: 'Same As',
    key: 'same-as',
    viewColumn: 'sameAs',
    getValue: retrieveValue('sameAs'),
  },
  {
    name: 'Is SEAS?',
    key: 'is-seas',
    viewColumn: 'isSEAS',
    getValue: retrieveValue('isSEAS'),
  },
  {
    name: 'Is Undergraduate?',
    key: 'is-undergraduate',
    viewColumn: 'isUndergraduate',
    getValue: retrieveValue('isUndergraduate'),
  },
  {
    name: 'Offered',
    key: 'offered-fall',
    viewColumn: 'offered',
    getValue: retrieveValue('offered', 'fall'),
  },
  {
    name: 'Instructors',
    key: 'instructors-fall',
    viewColumn: 'instructors',
    getValue: ({ fall: { instructors } }): ReactElement => (
      instructors.length === 0
        ? null
        : (
          <ol>
            {instructors.map(
              (prof): ReactElement => (
                <li key={prof.id}>
                  {prof.displayName}
                </li>
              )
            )}
          </ol>
        )
    ),
  },
  {
    name: 'Times',
    key: 'times-fall',
    viewColumn: 'times',
    getValue: ({ fall: { meetings } }): ReactElement => (
      meetings[0].day === null
        ? null
        : (
          <ol>
            {meetings.map((mtg): ReactElement => (
              <li key={mtg.id}>
                {`${mtg.day}: ${mtg.startTime}-${mtg.endTime}`}
              </li>
            ))}
          </ol>
        )
    ),
  },
  {
    name: 'Room',
    key: 'rooms-fall',
    viewColumn: 'rooms',
    getValue: ({ fall: { meetings } }): ReactElement => (
      meetings[0].day === null
        ? null
        : (
          <ol>
            {meetings.map((mtg): ReactElement => (
              mtg.room !== null
              && (
                <li key={mtg.id}>
                  {mtg.room.name}
                </li>
              )
            ))}
          </ol>
        )
    ),
  },
  {
    name: 'Pre',
    key: 'pre-enrollment-fall',
    viewColumn: 'preEnrollment',
    getValue: retrieveValue('preEnrollment', 'fall'),
  },
  {
    name: 'Study',
    key: 'study-card-enrollment-fall',
    viewColumn: 'studyCardEnrollment',
    getValue: retrieveValue('studyCardEnrollment', 'fall'),
  },
  {
    name: 'Actual',
    key: 'actual-enrollment-fall',
    viewColumn: 'actualEnrollment',
    getValue: retrieveValue('actualEnrollment', 'fall'),
  },
  {
    name: 'Offered',
    key: 'offered-spring',
    viewColumn: 'offered',
    getValue: retrieveValue('offered', 'spring'),
  },
  {
    name: 'Instructors',
    key: 'instructors-spring',
    viewColumn: 'instructors',
    getValue: ({ spring: { instructors } }): ReactElement => (
      instructors.length === 0
        ? null
        : (
          <ol>
            {instructors.map(
              (prof): ReactElement => (
                <li key={prof.id}>
                  {prof.displayName}
                </li>
              )
            )}
          </ol>
        )
    ),
  },
  {
    name: 'Times',
    key: 'times-spring',
    viewColumn: 'times',
    getValue: ({ spring: { meetings } }): ReactElement => (
      meetings[0].day === null
        ? null
        : (
          <ol>
            {meetings.map((mtg): ReactElement => (
              <li key={mtg.id}>
                {`${mtg.day}: ${mtg.startTime}-${mtg.endTime}`}
              </li>
            ))}
          </ol>
        )
    ),
  },
  {
    name: 'Room',
    key: 'rooms-spring',
    viewColumn: 'rooms',
    getValue: ({ spring: { meetings } }): ReactElement => (
      meetings[0].day === null
        ? null
        : (
          <ol>
            {meetings.map((mtg): ReactElement => (
              mtg.room !== null
              && (
                <li key={mtg.id}>
                  {mtg.room.name}
                </li>
              )
            ))}
          </ol>
        )
    ),
  },
  {
    name: 'Pre',
    key: 'pre-enrollment-spring',
    viewColumn: 'preEnrollment',
    getValue: retrieveValue('preEnrollment', 'spring'),
  },
  {
    name: 'Study',
    key: 'study-card-enrollment-spring',
    viewColumn: 'studyCardEnrollment',
    getValue: retrieveValue('studyCardEnrollment', 'spring'),
  },
  {
    name: 'Actual',
    key: 'actual-enrollment-spring',
    viewColumn: 'actualEnrollment',
    getValue: retrieveValue('actualEnrollment', 'spring'),
  },
  {
    name: 'Notes',
    key: 'notes',
    viewColumn: 'notes',
    getValue: retrieveValue('notes'),
  },
];
