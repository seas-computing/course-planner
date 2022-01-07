import {
  COURSE_TABLE_COLUMN,
  COURSE_TABLE_COLUMN_GROUP,
} from 'common/constants';

/**
 * Describes the columns in the CourseInstanceList
 */

export interface ModalFieldsColumn {
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
}

/**
 * An array of objects that define the data in the [[CourseInstanceList]], and
 * provide a method for outputting it in the correct format.
 */

export const modalFields: ModalFieldsColumn[] = [
  {
    name: 'Area',
    key: 'area',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.AREA,
  },
  {
    name: 'Course',
    key: 'catalog-number',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.CATALOG_NUMBER,
  },
  {
    name: 'Title',
    key: 'title',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.TITLE,
  },
  {
    name: 'Same As',
    key: 'same-as',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.SAME_AS,
  },
  {
    name: 'Is SEAS?',
    key: 'is-seas',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.IS_SEAS,
  },
  {
    name: 'Is Undergraduate?',
    key: 'is-undergraduate',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.COURSE,
    viewColumn: COURSE_TABLE_COLUMN.IS_UNDERGRADUATE,
  },
  {
    name: 'Offered',
    key: 'offered',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SEMESTER,
    viewColumn: COURSE_TABLE_COLUMN.OFFERED,
  },
  {
    name: 'Instructors',
    key: 'instructors',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SEMESTER,
    viewColumn: COURSE_TABLE_COLUMN.INSTRUCTORS,
  },
  {
    name: 'Meetings',
    key: 'meetings',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SEMESTER,
    viewColumn: COURSE_TABLE_COLUMN.MEETINGS,
  },
  {
    name: 'Enrollment',
    key: 'enrollment',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.SEMESTER,
    viewColumn: COURSE_TABLE_COLUMN.ENROLLMENT,
  },
  {
    name: 'Notes',
    key: 'notes',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.META,
    viewColumn: COURSE_TABLE_COLUMN.NOTES,
  },
  {
    name: 'Details',
    key: 'details',
    columnGroup: COURSE_TABLE_COLUMN_GROUP.META,
    viewColumn: COURSE_TABLE_COLUMN.DETAILS,
  },
];
