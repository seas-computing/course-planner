import { strictEqual } from 'assert';
import { Authentication } from '../../auth/authentication.guard';

describe('Authentication guard', function () {
  it('allows access in development mode', async function () {
    const guard = new Authentication({ isProduction: false } as never);

    strictEqual(guard.canActivate({} as never), true);
  });
});
