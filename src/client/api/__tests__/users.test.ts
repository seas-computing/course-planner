import { User } from 'common/classes';
import {
  stub,
  SinonStub,
} from 'sinon';
import * as dummy from 'testData';
import * as api from 'client/api/users';
import {
  strictEqual,
  deepStrictEqual,
  rejects,
} from 'assert';
import request, {
  AxiosResponse,
} from '../request';

describe('User API', function () {
  let result: User;
  let getStub: SinonStub;
  const locationReplaceStub = stub();
  let globalWindow: Window & typeof globalThis;
  describe('getCurrentUser', function () {
    beforeEach(function () {
      // window.location.replace can't be stubbed directly, so we need to
      // manually replace then restore the function on the global object
      globalWindow = global.window;
      global.window = {
        location: {
          replace: locationReplaceStub,
        } as unknown as Location,
      } as unknown as Window & typeof globalThis;
      getStub = stub(request, 'get');
    });
    afterEach(function () {
      global.window = globalWindow;
    });
    context('when data fetch succeeds', function () {
      beforeEach(async function () {
        getStub.resolves({
          data: dummy.regularUser,
        } as AxiosResponse<User>);
        result = await api.getCurrentUser();
      });
      it('should call request.get', function () {
        strictEqual(getStub.callCount, 1);
      });
      it('should request /api/users/current', function () {
        const [[path]] = getStub.args;
        strictEqual(path, '/api/users/current');
      });
      it('should return the user', function () {
        deepStrictEqual(result, dummy.regularUser);
      });
    });
    context('when data fetch fails', function () {
      context('With an Axios 401 error', function () {
        let prevURL: string;
        const SERVER_URL = 'https://computingapps.seas.harvard.edu';
        beforeEach(async function () {
          const error401 = {
            response: {
              status: 401,
            },
          };
          getStub.rejects(error401);
          // replace and restore the SERVER_URL env var
          prevURL = process.env.SERVER_URL;
          process.env.SERVER_URL = SERVER_URL;
          await api.getCurrentUser();
        });
        afterEach(function () {
          process.env.SERVER_URL = prevURL;
        });
        it('should redirect', function () {
          strictEqual(locationReplaceStub.callCount, 1);
        });
        it('Should send the user to SERVER_URL/login', function () {
          strictEqual(locationReplaceStub.args[0][0], `${SERVER_URL}/login`);
        });
      });
    });
    context('With any other error', function () {
      beforeEach(function () {
        getStub.rejects(dummy.error);
      });
      it('should throw an error', async function () {
        return rejects(async () => {
          await api.getCurrentUser();
        }, dummy.error);
      });
    });
  });
});
