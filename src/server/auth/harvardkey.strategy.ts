import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Req } from '@nestjs/common';
import { AUTH_MODE } from 'common/constants';
import { User } from 'common/classes';

/**
 * Implements passport strategy to connect to Harvard Key for authentication
 */

@Injectable()
class HarvardKeyStrategy extends PassportStrategy(Strategy, AUTH_MODE.HKEY) {
  public validate(
    @Req() req: Request
  ): User | boolean {
    if (req.session.user) {
      return new User(req.session.user);
    }
    throw new UnauthorizedException('You are not authorized to use this application. Please contact SEAS computing');
  }
}

export { HarvardKeyStrategy };
