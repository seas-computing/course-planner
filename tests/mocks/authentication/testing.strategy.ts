import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AUTH_MODE } from 'common/constants';
import { Request } from 'express';
import { regularUser } from 'testData';
import { User } from '../../../src/server/user/user.entity';

/**
 * A stubbable PassportStrategy for use in testing.
 */

@Injectable()
class TestingStrategy extends PassportStrategy(Strategy, AUTH_MODE.TEST) {
  /**
   * Resolves whatever value is resolved by login(), or throws a
   * ForbiddenException if login() throws.
   */
  public async validate(req: Request): Promise<Request> {
    const userData = await this.login();
    req.session.user = { ...userData };
    return req;
  }

  /**
   * A function that returns a user object. In tests, this can be stubbed with
   * Sinon to control what value the authentication stage will return.
   */
  public login(): Promise<User> {
    return Promise.resolve(regularUser);
  }
}

export { TestingStrategy };
