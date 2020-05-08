
/**
 * Group name mapping constants used to map the verbose group names returned
 * by grouper to something more manageable within the application.
 */
enum GROUP {
  /**
   * Users who are considered to have administrative privileges in the application
   */
  ADMIN = 'authorized-admins-seas-course-planning',
  /**
   * Users who have read-only privileges
   */
  READ_ONLY = 'read-only-users-seas-course-planning'
}


export default GROUP;
