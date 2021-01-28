import {
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Stand-in symbol for an AuthGuard that can be dynamically generated and
 * injected as part of the AuthModule
 * */

@Injectable()
abstract class Authentication extends AuthGuard() { }

export { Authentication };
