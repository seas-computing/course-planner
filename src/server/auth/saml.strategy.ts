import { Strategy } from 'passport-saml';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_MODE } from 'common/constants';
import { HarvardKeyProfile } from '../user/harvardKey.interface';
import { User } from '../user/user.entity';
import { ConfigService } from '../config/config.service';

/**
 * Implements passport-saml to connect to Harvard Key for authentication
 */

@Injectable()
class SAMLStrategy extends PassportStrategy(Strategy, AUTH_MODE.HKEY) {
  public constructor(config: ConfigService) {
    super({
      entryPoint: config.get('CAS_URL'),
      issuer: 'passport-saml',
      host: config.get('EXTERNAL_URL'),
    });
  }

  public async validate(profile?: HarvardKeyProfile): Promise<User> {
    if (!profile) {
      throw new UnauthorizedException('You are not authorized to use this application. Please contact SEAS computing');
    }
    const authenticatedUser = new User({
      eppn: profile.eppn,
      firstName: profile.givenName,
      lastName: profile.sn,
      email: profile.email,
    });
    return authenticatedUser;
  }
}

export { SAMLStrategy };
