import { User } from 'common/classes';
import { GROUP } from 'common/constants';

export const regularUser = new User({
  firstName: 'Regular',
  lastName: 'User',
  eppn: '4A2849CF119852@harvard.edu',
  email: 'regularUser@seas.harvard.edu',
});

export const adminUser = new User({
  firstName: 'Admin',
  lastName: 'User',
  eppn: 'ABCDEFGHIJKLMN@harvard.edu',
  email: 'adminUser@seas.harvard.edu',
  groups: [GROUP.ADMIN],
});

export const readOnlyUser = new User({
  firstName: 'ReadOnly',
  lastName: 'User',
  eppn: 'ZYXWVUTSRQPONM@harvard.edu',
  email: 'readOnlyUser@seas.harvard.edu',
  groups: [GROUP.READ_ONLY],
});

/**
 * A [[User]] authorized to manage non-class events
 */
export const nonClassEventManager = new User({
  firstName: 'Non-class Event',
  lastName: 'Manager',
  eppn: 'MLKJIHGFEDCBAZ@harvard.edu',
  email: 'nonClasseventManager@seas.harvard.edu',
  groups: [GROUP.NON_CLASS],
});
