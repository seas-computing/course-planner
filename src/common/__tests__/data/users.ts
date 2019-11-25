import { User } from 'server/user/user.entity';

export const regularUser = new User({
  firstName: 'Regular',
  lastName: 'User',
  eppn: '4A2849CF119852@harvard.edu',
  email: 'test@seas.harvard.edu',
});
