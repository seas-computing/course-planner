import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '../config/config.service';

/**
 * Extends Passport's default AuthGuard with a new implementation
 * that allows everything through when not in production.
 */

@Injectable()
class Authentication extends AuthGuard('saml') {
  private readonly isProduction: boolean;

  public constructor(config: ConfigService) {
    super();
    this.isProduction = config.isProduction;
  }

  public canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.isProduction) {
      return super.canActivate(context);
    }
    return true;
  }
}

export { Authentication };
