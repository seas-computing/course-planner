import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SAMLStrategy } from './saml.strategy';
import { Authentication } from './authentication.guard';

/**
 * Exposes the PassportModule with SAMLStrategy for injection
 */

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'saml' })],
  providers: [
    SAMLStrategy,
    Authentication,
  ],
  exports: [],
})
class AuthModule { }

export { AuthModule };
