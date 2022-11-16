import { deepStrictEqual, fail, strictEqual } from 'assert';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import { SinonStub, stub } from 'sinon';
import {
  adminRoomsResponse,
  createSEC555Room,
  error,
  sec555RoomResponse,
} from 'testData';
import request, { AxiosResponse } from '../request';
import { LocationAPI } from '../rooms';

describe('Location API', function () {
  let getAdminRoomsResponse: RoomAdminResponse[];
  let getStub: SinonStub;
  let postStub: SinonStub;
  let createRoomResult: RoomAdminResponse;
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
  describe('POST /rooms', function () {
    beforeEach(function () {
      postStub = stub(request, 'post');
    });
    context('when successfully creating a room', function () {
      beforeEach(async function () {
        postStub.resolves({
          data: sec555RoomResponse,
        } as AxiosResponse<RoomAdminResponse>);
        createRoomResult = await LocationAPI
          .createRoom(createSEC555Room);
      });
      it('should make the request to /api/rooms/', function () {
        const [[path]] = postStub.args;
        strictEqual(path, '/api/rooms/');
        strictEqual(postStub.callCount, 1);
      });
      it('should return the created room', function () {
        deepStrictEqual(
          createRoomResult,
          sec555RoomResponse
        );
      });
    });
    context('when failing to create a room', function () {
      const errorMessage = 'There was a problem with creating a room.';
      beforeEach(function () {
        postStub.rejects(new Error(errorMessage));
      });
      it('should throw an error', async function () {
        try {
          await LocationAPI.createRoom(createSEC555Room);
          fail('Did not throw an error');
        } catch (err) {
          strictEqual((err as Error).message, errorMessage);
        }
      });
    });
  });
});
