/**
 * @module server/dto/users/userResponse
 */

import { GROUP } from 'common/constants';

/**
 * User Response
 *
 * Represents the format of user objects returned by the server in response to
 * API requests for users (i.e: getting the current user, getting a list of all
 * users etc.)
 */

export abstract class UserResponse {
  public eppn: string;

  public firstName: string;

  public lastName: string;

  public email: string;

  public fullName: string;

  public listName: string;

  public groups: GROUP[];
}
