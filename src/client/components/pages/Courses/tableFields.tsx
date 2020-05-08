import React, { ReactElement, ReactNode, useState } from 'react';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  Button,
  BorderlessButton,
  VARIANT,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from 'mark-one';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote as withNotes, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { faStickyNote as withoutNotes } from '@fortawesome/free-regular-svg-icons';

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
): string => {
  const rawValue = sem
    ? course[sem][prop]
    : course[prop];
  if (typeof rawValue === 'boolean') {
    return rawValue ? 'Yes' : 'No';
  }
  return rawValue;
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
    getValue: retrieveValue('offered', 'fall'),
  },
  {
    name: 'Instructors',
    key: 'instructors-fall',
    columnGroup: COLUMN_GROUP.FALL,
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
    columnGroup: COLUMN_GROUP.FALL,
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
    columnGroup: COLUMN_GROUP.FALL,
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
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'enrollment',
    getValue: retrieveValue('preEnrollment', 'fall'),
  },
  {
    name: 'Study',
    key: 'study-card-enrollment-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'enrollment',
    getValue: retrieveValue('studyCardEnrollment', 'fall'),
  },
  {
    name: 'Actual',
    key: 'actual-enrollment-fall',
    columnGroup: COLUMN_GROUP.FALL,
    viewColumn: 'enrollment',
    getValue: retrieveValue('actualEnrollment', 'fall'),
  },
  {
    name: 'Offered',
    key: 'offered-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'offered',
    getValue: retrieveValue('offered', 'spring'),
  },
  {
    name: 'Instructors',
    key: 'instructors-spring',
    columnGroup: COLUMN_GROUP.SPRING,
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
    columnGroup: COLUMN_GROUP.SPRING,
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
    columnGroup: COLUMN_GROUP.SPRING,
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
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'enrollment',
    getValue: retrieveValue('preEnrollment', 'spring'),
  },
  {
    name: 'Study',
    key: 'study-card-enrollment-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'enrollment',
    getValue: retrieveValue('studyCardEnrollment', 'spring'),
  },
  {
    name: 'Actual',
    key: 'actual-enrollment-spring',
    columnGroup: COLUMN_GROUP.SPRING,
    viewColumn: 'enrollment',
    getValue: retrieveValue('actualEnrollment', 'spring'),
  },
  {
    name: 'Notes',
    key: 'notes',
    columnGroup: COLUMN_GROUP.META,
    viewColumn: 'notes',
    getValue: ({ notes, catalogNumber }): ReactElement => {
      const hasNotes = notes && notes.trim().length > 0;
      const [modalOpen, toggleModal] = useState(false);
      return (
        <React.Fragment>
          <BorderlessButton
            variant={VARIANT.INFO}
            disabled={!hasNotes}
            onClick={(): void => { if (hasNotes) { toggleModal(true); } }}
          >
            <FontAwesomeIcon icon={hasNotes ? withNotes : withoutNotes} />
          </BorderlessButton>
          {hasNotes && (
            <Modal
              isVisible={modalOpen}
              closeHandler={(): void => { toggleModal(false); }}
            >
              <ModalHeader
                closeButtonHandler={(): void => { toggleModal(false); }}
              >
                {`${catalogNumber} Notes`}
              </ModalHeader>
              <ModalBody>
                {notes}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant={VARIANT.DEFAULT}
                  onClick={(): void => { toggleModal(false); }}
                >
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          )}
        </React.Fragment>
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
