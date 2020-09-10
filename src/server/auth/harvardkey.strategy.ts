import { Request } from 'express';
import { Strategy, HarvardKeyProfile } from '@seas-computing/passport-harvardkey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Req } from '@nestjs/common';
import { AUTH_MODE } from 'common/constants';
import { User } from 'common/classes';
import { ConfigService } from '../config/config.service';

/**
 * Implements passport strategy to connect to Harvard Key for authentication
 */

@Injectable()
class HarvardKeyStrategy extends PassportStrategy(Strategy, AUTH_MODE.HKEY) {
  public constructor(config: ConfigService) {
    super({
      casServerBaseURL: config.get('CAS_URL'),
      service: `${config.get('SERVER_URL')}/login`,
    });
  }

  public validate(
    profile: HarvardKeyProfile,
    @Req() req: Request
  ): User {
    if (!profile) {
      throw new UnauthorizedException('You are not authorized to use this application. Please contact SEAS computing');
    }
    const authenticatedUser = new User({
      eppn: profile.eppn,
      firstName: profile.givenName,
      lastName: profile.sn,
    });
    req.session.user = authenticatedUser;
    return authenticatedUser;
  }
}

export { HarvardKeyStrategy };
