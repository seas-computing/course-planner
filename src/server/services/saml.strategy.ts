import { Strategy } from 'passport-saml';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HarvardKeyProfile } from '../interfaces';
import { User } from '../models';
import { ConfigService } from './config.service';

/**
 * Implements passport-saml to connect to Harvard Key for authentication
 */

@Injectable()
class SAMLStrategy extends PassportStrategy(Strategy) {
  private readonly devMode: boolean;

  public constructor(config: ConfigService) {
    super({
      entryPoint: config.get('CAS_URL'),
      issuer: 'passport-saml',
      host: config.get('EXTERNAL_URL'),
    });
    this.devMode = !config.isProduction;
  }

  public async validate(profile: HarvardKeyProfile): Promise<User> {
    if (this.devMode) {
      return new User({
        id: 'abc123',
        firstName: 'Test',
        lastName: 'User',
        email: 'noreply@seas.harvard.edu',
      });
    }
    if (!profile) {
      throw new UnauthorizedException('You are not authorized to use this application. Please contact SEAS computing');
    }
    return new User({
      id: profile.eppn,
      firstName: profile.givenName,
      lastName: profile.sn,
      email: profile.email,
    });
  }
}

export { SAMLStrategy };
