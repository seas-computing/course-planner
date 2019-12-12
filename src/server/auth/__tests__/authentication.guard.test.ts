import { strictEqual } from 'assert';
import { ExecutionContext } from '@nestjs/common';
import { stub } from 'sinon';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from 'server/config/config.service';
import { Authentication } from '../../auth/authentication.guard';

describe('Authentication guard', function () {
  beforeEach(function () {
    stub(AuthGuard('saml').prototype, 'canActivate');
  });
  afterEach(function () {
    AuthGuard('saml').prototype.canActivate.restore();
  });

  it('allows access in development mode', function () {
    const guard = new Authentication(new ConfigService({
      NODE_ENV: 'development',
    }));

    strictEqual(guard.canActivate({} as ExecutionContext), true);
  });

  it('requries authentication in production mode', function () {
    new Authentication(new ConfigService({
      NODE_ENV: 'production',
    }))
      .canActivate({} as ExecutionContext);

    strictEqual(AuthGuard('saml').prototype.canActivate.callCount, 1);
  });
});
