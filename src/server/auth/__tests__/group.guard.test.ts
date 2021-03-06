import { strictEqual } from 'assert';
import { ExecutionContext } from '@nestjs/common';
import { stub } from 'sinon';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { GROUP } from 'common/constants';
import { regularUser, adminUser } from 'testData';
import { RequireGroup } from '../group.guard';

describe('Group guard', function () {
  let guard: RequireGroup;

  beforeEach(function () {
    guard = new RequireGroup(GROUP.ADMIN);
  });

  it('allows access for users who are members of the specified group', function () {
    const context: Partial<ExecutionContext> = {
      switchToHttp: stub().returns({
        getRequest: () => ({
          session: {
            user: adminUser,
          },
        }),
        getResponse: stub(),
        getNext: stub(),
      } as HttpArgumentsHost),
    };

    strictEqual(guard.canActivate(context as ExecutionContext), true);
  });

  it('denies access for users who are not members of the specified group', function () {
    const context: Partial<ExecutionContext> = {
      switchToHttp: stub().returns({
        getRequest: () => ({
          session: {
            user: regularUser,
          },
        }),
        getResponse: stub(),
        getNext: stub(),
      } as HttpArgumentsHost),
    };

    strictEqual(guard.canActivate(context as ExecutionContext), false);
  });

  it('denies access when there is no session', function () {
    const context: Partial<ExecutionContext> = {
      switchToHttp: stub().returns({
        getRequest: () => ({}),
        getResponse: stub(),
        getNext: stub(),
      } as HttpArgumentsHost),
    };

    strictEqual(guard.canActivate(context as ExecutionContext), false);
  });

  it('denies access when there is no user in the session', function () {
    const context: Partial<ExecutionContext> = {
      switchToHttp: stub().returns({
        getRequest: () => ({
          session: {},
        }),
        getResponse: stub(),
        getNext: stub(),
      } as HttpArgumentsHost),
    };

    strictEqual(guard.canActivate(context as ExecutionContext), false);
  });
});
