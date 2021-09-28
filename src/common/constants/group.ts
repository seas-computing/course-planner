/**
 * Group name mapping constants used to map the verbose group names returned
 * by grouper to something more manageable within the application.
 */
enum GROUP {
  /**
   * Users who are considered to have administrative privileges in the application
   */
  ADMIN = 'harvard:org:schools:seas:managed:seas-course-planning:roles-admin-seas-course-planning',

  /**
   * Users who have read-only privileges
   */
  READ_ONLY = 'harvard:org:schools:seas:managed:seas-course-planning:authorized-all-users-seas-course-planning',

  /**
   * Users who have permission to interact with the non-class event API
   *
   * @todo Put a real value from grouper in here
   */
  NON_CLASS = '',
}

export default GROUP;
