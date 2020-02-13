import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AUTH_MODE } from 'common/constants';
import { Request } from 'express';
import { User } from '../user/user.entity';

/**
 * Uses passport-custom to always authenticate as a specific user
 */

@Injectable()
class DevStrategy extends PassportStrategy(Strategy, AUTH_MODE.DEV) {
  public async validate(req: Request): Promise<Request> {
    req.session.user = new User({
      eppn: 'abc123@harvard.edu',
      firstName: 'Test',
      lastName: 'User',
      email: 'noreply@seas.harvard.edu',
    });
    return req;
  }
}

export { DevStrategy };
