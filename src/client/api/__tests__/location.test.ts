import { deepStrictEqual, fail, strictEqual } from 'assert';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import { SinonStub, stub } from 'sinon';
import { adminRoomsResponse, error } from 'testData';
import request from '../request';
import { LocationAPI } from '../rooms';

describe('Location API', function () {
  let getAdminRoomsResponse: RoomAdminResponse[];
  let getStub: SinonStub;
  describe('GET /rooms/admin', function () {
    beforeEach(function () {
      getStub = stub(request, 'get');
    });
    afterEach(function () {
      getStub.restore();
    });
    describe('gets all room information', function () {
      context('when data fetch succeeds', function () {
        beforeEach(async function () {
          getStub.resolves({
            data: adminRoomsResponse,
          });
          getAdminRoomsResponse = await LocationAPI.getAdminRooms();
        });
        it('should call getAdminRooms', function () {
          strictEqual(getStub.callCount, 1);
        });
        it('should request /api/rooms/admin', function () {
          const [[path]] = getStub.args;
          strictEqual(path, '/api/rooms/admin');
        });
        it('should return the rooms information', function () {
          deepStrictEqual(getAdminRoomsResponse, adminRoomsResponse);
        });
      });
      context('when data fetch fails', function () {
        beforeEach(function () {
          getStub.rejects();
        });
        it('should throw an error', async function () {
          try {
            await LocationAPI.getAdminRooms();
            fail('Did not throw an error');
          } catch (err) {
            deepStrictEqual(err, error);
          }
        });
      });
    });
  });
});
