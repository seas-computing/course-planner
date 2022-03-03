import { useContext, useMemo } from 'react';
import { checkUserGroup } from 'common/utils/checkUserGroup';
import { GROUP } from '../../common/constants';
import { UserContext } from '../context';

/**
 * Descibes the dictionary of possible permissions based on the user's group
 * membership
 */
export interface AuthorizedPermissions {
  /**
   * Returns true if this is a valid user. A false value implies that this is
   * an anonymous user. Note that it is technically possible to be logged in
   * without any group membership, so we should not assume a logged in user has
   * read-only permission
   */
  isLoggedIn: boolean;
  /**
   * True if the user is permitted to view protected content within the
   * course-planning app. If this is false and isLoggedIn is true, the user may
   * be missing group memberships.
   * A value of true also implies that isLoggedIn is true.
   */
  isReadOnly: boolean;
  /**
   * True if the user has admin permission, which allows access to read and
   * edit all content in the course-planning app. This being true also implies
   * that isReadOnly and isLoggedIn are true as well.
   */
  isAdmin: boolean;
}

/**
 * Custom hook that captures the current logged in user from the context, then
 * applies our group-checking logic and returns a dictionary of permissions
 */

export const useGroupGuard = (): AuthorizedPermissions => {
  const user = useContext(UserContext);
  return useMemo(
    () => {
      if (!user?.eppn) {
        return {
          isLoggedIn: false,
          isReadOnly: false,
          isAdmin: false,
        };
      }
      return {
        isLoggedIn: true,
        isReadOnly: checkUserGroup(user, GROUP.READ_ONLY),
        isAdmin: checkUserGroup(user, GROUP.ADMIN),
      };
    },
    [user]
  );
};
