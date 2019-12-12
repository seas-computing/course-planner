import { GROUP } from 'common/constants';

/**
 * Basic user representing the format of user data within this application.
 *
 */
export class User {
  /**
   * Unique ID representing a user.
   *
   * See [[HarvardKeyProfile.eppn]] for more information
   */
  public eppn: string;

  /**
   * User's first name
   * @example James
   */
  public firstName: string;

  /**
   * User's Last name
   * @example Waldo
   */
  public lastName: string;

  /**
   * User's email address
   * @example waldo@harvard.edu
   */
  public email: string;

  /**
   * A list of grouper group names that the user belongs to
   * @example ['authorized-admins-seas-course-planning']
   */
  public groups?: GROUP[] = [];

  /**
   * Instanciates a new [[User]] and (optionally) hydrates with data
   *
   * @param {ObjectLiteral} data
   * @param {ObjectLiteral} data.eppn A unique ID identifying a user, provided by HarvardKey. Typically in the format of `<random identifier>@harvard.edu`
   * @param {ObjectLiteral} data.firstName The user's given (first) name
   * @param {ObjectLiteral} data.firstName The user's surname name
   * @param {ObjectLiteral} data.email The user's email address
   */
  public constructor(data: {
    eppn: string;
    firstName: string;
    lastName: string;
    email: string;
    groups?: GROUP[];
  } = {
    eppn: '',
    firstName: '',
    lastName: '',
    email: '',
    groups: [],
  }) {
    this.eppn = data.eppn;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.groups = data.groups;
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
