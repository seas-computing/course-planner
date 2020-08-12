import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AUTH_MODE, GROUP } from 'common/constants';
import { User } from 'common/classes';

/**
 * Uses passport-custom to always authenticate as a specific user
 */

@Injectable()
class DevStrategy extends PassportStrategy(Strategy, AUTH_MODE.DEV) {
  public validate(): User {
    return new User({
      eppn: 'abc123@harvard.edu',
      firstName: 'Test',
      lastName: 'User',
      email: 'noreply@seas.harvard.edu',
      groups: [GROUP.ADMIN, GROUP.READ_ONLY],
    });
  }
}

export { DevStrategy };
