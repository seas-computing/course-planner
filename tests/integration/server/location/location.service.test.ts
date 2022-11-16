import { strictEqual } from 'assert';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LocationService } from 'server/location/location.service';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { LocationModule } from 'server/location/location.module';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE } from 'common/constants';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import { CreateRoomRequest } from 'common/dto/room/CreateRoomRequest.dto';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { campuses, rooms } from '../../../mocks/database/population/data';

describe('Location Service', function () {
  let testModule: TestingModule;
  let locationService: LocationService;
  let createRoomRequest: CreateRoomRequest;

  beforeEach(async function () {
    testModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (
            config: ConfigService
          ): TypeOrmModuleOptions => ({
            ...config.dbOptions,
            synchronize: true,
            autoLoadEntities: true,
            retryAttempts: 10,
            retryDelay: 10000,
          }),
          inject: [ConfigService],
        }),
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
        PopulationModule,
        LocationModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();

    locationService = testModule.get(LocationService);
    await testModule.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('createRoom', function () {
    let result: RoomAdminResponse;
    let response;
    context('when trying to create a room with a non-existent campus', function () {
      beforeEach(async function () {
        createRoomRequest = {
          campus: 'nonExistentCampus',
          building: rooms[0].name,
          name: '318a',
          capacity: 35,
        };
        try {
          result = await locationService.createRoom(createRoomRequest);
        } catch (error) {
          response = error;
        }
      });
      it('should throw a Not Found exception', function () {
        strictEqual(response.status, 404);
      });
    });
    context('when creating a new room in an existing campus and new building', function () {
      const room = rooms[0];
      const testCampus = campuses[1].name;
      const testBuilding = 'newBuilding';
      const testRoom = room.name + 'a';
      const testCapacity = room.capacity;
      beforeEach(async function () {
        createRoomRequest = {
          campus: testCampus,
          building: testBuilding,
          name: testRoom,
          capacity: testCapacity,
        };
        try {
          result = await locationService.createRoom(createRoomRequest);
        } catch (error) {
          response = error;
        }
      });
      it('should return the created room information', function () {
        strictEqual(result.building.campus.name, testCampus, 'The campuses do not match.');
        strictEqual(result.building.name, testBuilding, 'The buildings do not match.');
        strictEqual(result.name, testRoom, 'The room numbers do not match.');
        strictEqual(result.capacity, testCapacity, 'The capacities do not match.');
      });
    });
    context('when creating a new room in an existing campus and existing building', function () {
      const room = rooms[0];
      const testCampus = campuses[1].name;
      const testBuilding = room.building;
      const testRoom = room.name + 'a';
      const testCapacity = room.capacity;
      beforeEach(async function () {
        createRoomRequest = {
          campus: testCampus,
          building: testBuilding,
          name: testRoom,
          capacity: testCapacity,
        };
        try {
          result = await locationService.createRoom(createRoomRequest);
        } catch (error) {
          response = error;
        }
      });
      it('should return the created room information', function () {
        strictEqual(result.building.campus.name, testCampus, 'The campuses do not match.');
        strictEqual(result.building.name, testBuilding, 'The buildings do not match.');
        strictEqual(result.name, testRoom, 'The room numbers do not match.');
        strictEqual(result.capacity, testCapacity, 'The capacities do not match.');
      });
    });
    context('when trying to create an existing room', function () {
      const room = rooms[0];
      const testCampus = campuses[1].name;
      const testBuilding = room.building;
      const testRoom = room.name;
      const testCapacity = room.capacity;
      beforeEach(async function () {
        createRoomRequest = {
          campus: testCampus,
          building: testBuilding,
          name: testRoom,
          capacity: testCapacity,
        };
        try {
          result = await locationService.createRoom(createRoomRequest);
        } catch (error) {
          response = error;
        }
      });
      it('should throw a Bad Request error', function () {
        strictEqual(response.status, 400);
      });
    });
  });
});
