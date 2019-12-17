import { strictEqual } from 'assert';
import { ExecutionContext } from '@nestjs/common';
import { stub } from 'sinon';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { GROUP } from 'common/constants';
import { regularUser } from 'testData';
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
            user: {
              ...regularUser,
              groups: [GROUP.ADMIN],
            },
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
            user: {
              ...regularUser,
              groups: [],
            },
          },
        }),
        getResponse: stub(),
        getNext: stub(),
      } as HttpArgumentsHost),
    };

    strictEqual(guard.canActivate(context as ExecutionContext), false);
  });
});
