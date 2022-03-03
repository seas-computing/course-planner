import { User } from 'common/classes';
import { GROUP } from 'common/constants';

/**
 * Helper function that checks if a given [[User]] is eligible to access a
 * protected resource, based on the [[GROUP]]
 */

export const checkUserGroup = (user: User, requiredGroup: GROUP): boolean => {
  if (user && user.groups.length > 0) {
    // Allow admins to access any endpoint
    if (user.groups.includes(GROUP.ADMIN)) {
      return true;
    }
    // Allow members of any group to access read-only endpoints
    if (requiredGroup === GROUP.READ_ONLY) {
      return user.groups.some(
        (group) => Object.values(GROUP).includes(group)
      );
    }
    // For other cases, make sure they belong to the required group
    return user.groups.includes(requiredGroup);
  }
  return false;
};
