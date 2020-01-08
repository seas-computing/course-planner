import { User } from 'server/user/user.entity';
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
