import { strictEqual, throws } from 'assert';
import { TestingModule, Test } from '@nestjs/testing';
import { Request } from 'express';
import * as dummy from 'testData';
import { Authentication } from 'server/auth/authentication.guard';
import { UnauthorizedException } from '@nestjs/common';
import { SessionModule } from 'nestjs-session';
import { UserController } from '../user.controller';

describe('User controller', function () {
  let controller: UserController;

  beforeEach(async function () {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: { secret: dummy.safeString },
        }),
      ],
      controllers: [UserController],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .compile();

    controller = moduleRef.get<UserController>(UserController);
  });

  describe('getCurrentUser', function () {
    context('When there is a user saved in session', function () {
      it('returns the user', function () {
        const testSession = {
          user: dummy.regularUser,
        } as unknown as Express.Session;
        const result = controller.getCurrentUser({
          session: testSession,
        } as Request);
        strictEqual(result, dummy.regularUser);
      });
    });
    context('When there is no user in session', function () {
      it('throws an UnauthorizedException', function () {
        const testSession = {} as Express.Session;
        throws((): void => {
          controller.getCurrentUser({
            session: testSession,
          } as Request);
        }, UnauthorizedException);
      });
    });
  });
});
