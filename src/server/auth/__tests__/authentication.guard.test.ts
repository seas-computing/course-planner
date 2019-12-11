import { strictEqual } from 'assert';
import { ExecutionContext } from '@nestjs/common';
import { stub } from 'sinon';
import { AuthGuard } from '@nestjs/passport';
import { Authentication } from '../../auth/authentication.guard';

describe('Authentication guard', function () {
  beforeEach(function () {
    AuthGuard('saml').prototype.canActivate = stub();
  });
  afterEach(function () {
    AuthGuard('saml').prototype.canActivate.reset();
  });

  it('allows access in development mode', async function () {
    const guard = new Authentication({ isProduction: false } as never);

    strictEqual(guard.canActivate({} as never), true);
  });

  it('requries authentication in production mode', function () {
    new Authentication({ isProduction: true } as never)
      .canActivate({} as ExecutionContext);

    strictEqual(AuthGuard('saml').prototype.canActivate.callCount, 1);
  });
});
