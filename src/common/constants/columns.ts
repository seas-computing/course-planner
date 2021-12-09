/**
 * Values for the user-selectable table columns
 */

export enum COURSE_TABLE_COLUMN {
  AREA = 'area',
  CATALOG_NUMBER = 'catalogNumber',
  TITLE = 'title',
  SAME_AS = 'sameAs',
  IS_SEAS = 'isSEAS',
  IS_UNDERGRADUATE = 'isUndergraduate',
  OFFERED = 'offered',
  INSTRUCTORS = 'instructors',
  MEETINGS = 'meetings',
  ENROLLMENT = 'enrollment',
  NOTES = 'notes',
  DETAILS = 'details',
}

/**
 * Constants by which to group columns
 */
export enum COURSE_TABLE_COLUMN_GROUP {
  SPRING='SPRING',
  FALL='FALL',
  COURSE='COURSE',
  META='META',
  SEMESTER='SEMESTER',
}

/**
 * These columns are ALWAYS shown regardless of user choice
 */
export const MANDATORY_COLUMNS = [
  COURSE_TABLE_COLUMN.AREA,
  COURSE_TABLE_COLUMN.CATALOG_NUMBER,
  COURSE_TABLE_COLUMN.DETAILS,
];
