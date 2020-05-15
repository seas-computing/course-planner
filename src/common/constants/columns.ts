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
  TIMES = 'times',
  ROOMS = 'rooms',
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
}
