import {
  strictEqual, deepStrictEqual, rejects,
} from 'assert';
import { TestingModule, Test } from '@nestjs/testing';
import { Request } from 'express';
import * as dummy from 'testData';
import { UnauthorizedException, HttpStatus } from '@nestjs/common';
import { stub, SinonStub } from 'sinon';
import { RedirectResponse } from '@nestjs/core/router/router-response-controller';
import axios from 'axios';
import { AuthController } from '../auth.controller';
import { ConfigService } from '../../config/config.service';
import { ConfigModule } from '../../config/config.module';

describe('Auth controller', function () {
  let controller: AuthController;
  const CLIENT_URL = 'https://planning.seas.harvard.edu';
  const CAS_URL = 'https://www.pin1.harvard.edu/cas';
  const SERVER_URL = 'https://computingapps.seas.harvard.edu';
  const GROUPER_PREFIX = 'harvard:included:group:';
  beforeEach(async function () {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
      ],
      controllers: [AuthController],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({
        CLIENT_URL,
        CAS_URL,
        GROUPER_PREFIX,
        SERVER_URL,
      }))
      .compile();

    controller = moduleRef.get<AuthController>(AuthController);
  });

  describe('useHarvardKeyLogin', function () {
    describe('Caching the referer path', function () {
      context('When there is a referer from the client associated with the request', function () {
        const testReferer = `${CLIENT_URL}/courses`;
        it('sets the loginOrigin in session', function () {
          const testRequest = {
            get: stub().withArgs('Referer').returns(testReferer),
            session: {},
          } as unknown as Request;
          controller.useHarvardKeyLogin(testRequest);
          strictEqual(testRequest.session.loginOrigin, testReferer);
        });
      });
      context('When there is a referer from another url associated with the request', function () {
        const testReferer = 'https://localhost/courses';
        it('does not set a loginOrigin in session', function () {
          const testRequest = {
            get: stub().withArgs('Referer').returns(testReferer),
            session: {},
          } as unknown as Request;
          controller.useHarvardKeyLogin(testRequest);
          strictEqual(testRequest.session.loginOrigin, undefined);
        });
      });
      context('When there is no referer associated with the request', function () {
        it('does not set a loginOrigin in session', function () {
          const testRequest = {
            get: stub().withArgs('Referer').returns(''),
            session: {},
          } as unknown as Request;
          controller.useHarvardKeyLogin(testRequest);
          strictEqual(testRequest.session.loginOrigin, undefined);
        });
      });
    });
    describe('Redirect', function () {
      let result: RedirectResponse;
      beforeEach(function () {
        const testRequest = {
          get: stub().withArgs('Referer').returns(''),
          session: {},
        } as unknown as Request;
        result = controller.useHarvardKeyLogin(testRequest);
      });
      it('Returns the url for the cas login endpoint', function () {
        const urlStart = result.url.slice(0, CAS_URL.length);
        strictEqual(urlStart, CAS_URL);
      });
      it('includes the server url in the service field', function () {
        const testURL = new URL(result.url);
        const testService = testURL.searchParams.get('service');
        strictEqual(testService, `${SERVER_URL}/validate`);
      });
      it('has a SEE_OTHER status code', function () {
        strictEqual(result.statusCode, HttpStatus.SEE_OTHER);
      });
    });
  });
  describe('validateHarvardKeyData', function () {
    let reqStub: SinonStub;
    let result: RedirectResponse;
    let testRequest: Request;
    const loginOrigin = `${CLIENT_URL}/origin`;
    const fakeTicket = 'ST-1856339-aA5Yuvrxzpv8Tau1cYQ7';
    const validGroups = [
      `${GROUPER_PREFIX}one`,
      `${GROUPER_PREFIX}two`,
    ];
    const invalidGroups = [
      'harvard:excluded:group:three',
      'harvard:excluded:group:four',
    ];
    context('With a ticket query param', function () {
      beforeEach(function () {
        reqStub = stub(axios, 'request');
      });
      context('When the response includes authenticationSuccess', function () {
        const fakeAssertion = {
          serviceResponse: {
            authenticationSuccess: {
              user: dummy.regularUser.eppn,
              attributes: {
                eduPersonPrincipalName: [dummy.regularUser.eppn],
                givenName: [dummy.regularUser.firstName],
                sn: [dummy.regularUser.lastName],
                memberOf: [
                  ...validGroups,
                  ...invalidGroups,
                ],
              },
            },
          },
        };
        context('When there is a loginOrigin in session', function () {
          beforeEach(async function () {
            testRequest = {
              session: {
                loginOrigin,
              },
            } as unknown as Request;
            reqStub.resolves({
              data: fakeAssertion,
            });
            result = await controller.validateHarvardKeyData(
              testRequest,
              fakeTicket
            );
          });
          it('Should return a redirect with a FOUND status code', function () {
            strictEqual(result.statusCode, HttpStatus.FOUND);
          });
          it('Should return the loginOrigin as redirect url', function () {
            strictEqual(result.url, loginOrigin);
          });
        });
        context('When there is no loginOrigin in session', function () {
          beforeEach(async function () {
            testRequest = {
              session: { },
            } as unknown as Request;
            reqStub.resolves({
              data: fakeAssertion,
            });
            result = await controller.validateHarvardKeyData(
              testRequest,
              fakeTicket
            );
          });
          it('Should return a redirect with a FOUND status code', function () {
            strictEqual(result.statusCode, HttpStatus.FOUND);
          });
          it('Should return the clientURL + /courses as redirect url', function () {
            strictEqual(result.url, `${CLIENT_URL}/courses`);
          });
        });
        context('When the assertion includes all data', function () {
          beforeEach(async function () {
            testRequest = {
              session: { },
            } as unknown as Request;
            reqStub.resolves({
              data: fakeAssertion,
            });
            result = await controller.validateHarvardKeyData(
              testRequest,
              fakeTicket
            );
          });
          it('Should set the eppn to the eduPersonPrincipalName', function () {
            strictEqual(
              testRequest.session.user.eppn,
              dummy.regularUser.eppn
            );
          });
          it('Should set the firstName to the givenName', function () {
            strictEqual(
              testRequest.session.user.firstName,
              dummy.regularUser.firstName
            );
          });
          it('Should set the lastName to the sn', function () {
            strictEqual(
              testRequest.session.user.lastName,
              dummy.regularUser.lastName
            );
          });
          it('Should only include groups with the GROUPER_PREFIX', function () {
            deepStrictEqual(
              testRequest.session.user.groups,
              validGroups
            );
          });
        });
        context('When the assertion is missing data', function () {
          const emptyAssertion = {
            serviceResponse: {
              authenticationSuccess: {
                user: dummy.regularUser.eppn,
                attributes: {},
              },
            },
          };
          beforeEach(async function () {
            testRequest = {
              session: { },
            } as unknown as Request;
            reqStub.resolves({
              data: emptyAssertion,
            });
            result = await controller.validateHarvardKeyData(
              testRequest,
              fakeTicket
            );
          });
          it('Should set the eppn to undefined', function () {
            strictEqual(testRequest.session.user.eppn, undefined);
          });
          it('Should set the firstName to undefined', function () {
            strictEqual(
              testRequest.session.user.firstName,
              undefined
            );
          });
          it('Should set the lastName to undefined', function () {
            strictEqual(
              testRequest.session.user.lastName,
              undefined
            );
          });
          it('Should set the groups to []', function () {
            deepStrictEqual(
              testRequest.session.user.groups,
              []
            );
          });
        });
      });
      context('when the response contains authenticationFailure', function () {
        const fakeAssertion = {
          serviceResponse: {
            authenticationFailure: {
              code: 'INVALID_REQUEST',
              description: dummy.string,
            },
          },
        };
        it('Should throw an UnauthorizedException with the error description', async function () {
          testRequest = {
            session: { },
          } as unknown as Request;
          reqStub.resolves({
            data: fakeAssertion,
          });
          return rejects(async () => {
            await controller.validateHarvardKeyData(
              testRequest,
              fakeTicket
            );
          }, dummy.string);
        });
      });
      context('when the response is invalid', function () {
        const fakeAssertion = {
          serviceResponse: {
            invalidField: {},
          },
        };
        it('Should throw an UnauthorizedException ', async function () {
          testRequest = {
            session: { },
          } as unknown as Request;
          reqStub.resolves({
            data: fakeAssertion,
          });
          return rejects(async () => {
            await controller.validateHarvardKeyData(
              testRequest,
              fakeTicket
            );
          }, UnauthorizedException);
        });
      });
    });
    context('Without the ticket', function () {
      it('Should throw an UnauthorizedException', async function () {
        return rejects(async () => {
          await controller.validateHarvardKeyData(
            {} as Request,
            ''
          );
        }, UnauthorizedException);
      });
    });
  });
  describe('logoutUserSession', function () {
    let result: RedirectResponse;
    let testRequest: Request;
    beforeEach(function () {
      testRequest = {
        session: {
          user: dummy.regularUser,
        },
      } as unknown as Request;
      result = controller.logoutUserSession(testRequest);
    });
    it('Should remove the user from the session', function () {
      strictEqual(testRequest.session.user, undefined);
    });
    it('Should return a SEE_OTHER redirect', function () {
      strictEqual(result.statusCode, HttpStatus.SEE_OTHER);
    });
    it('Should return a redirect to the logout path', function () {
      strictEqual(result.url, 'https://key.harvard.edu/logout');
    });
  });
});
