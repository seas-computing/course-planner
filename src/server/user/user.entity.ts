import { GROUP } from 'common/constants';

/**
 * Basic user representing the format of user data within this application.
 *
 */
export class User {
  /**
   * Unique ID representing a user.
   * See [[HarvardKeyProfile.eppn]] for more information
   *
   * @example 4A2849CF119852@harvard.edu
   */
  public eppn: string = '';

  /**
   * User's first name
   * @example James
   */
  public firstName: string = '';

  /**
   * User's Last name
   * @example Waldo
   */
  public lastName: string = '';

  /**
   * User's email address
   * @example waldo@harvard.edu
   */
  public email: string = '';

  /**
   * A list of grouper group names that the user belongs to
   * @example ```ts
   * ['authorized-admins-seas-course-planning']
   * ```
   */
  public groups: GROUP[] = [];

  /**
   * Instanciates a new [[User]] and (optionally) hydrates with data
   *
   * @param {object} data An object literal used to hydrate the User class.
   */
  public constructor(data: Partial<Omit<User, 'fullName' | 'listName'>> = {}) {
    Object.assign(this, data);
  }

  /**
   * Get the user's name as firstName lastName
   * @example Jim Waldo
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Get the user's name as lastName, firstName
   * @example Waldo, Jim
   */
  public get listName(): string {
    return `${this.lastName}, ${this.firstName}`;
  }
}
