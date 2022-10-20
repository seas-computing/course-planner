import { TestingModule, Test } from '@nestjs/testing';
import {
  stub,
  SinonStub,
  createStubInstance,
  SinonStubbedInstance,
} from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  deepStrictEqual,
} from 'assert';
import { SelectQueryBuilder } from 'typeorm';
import { CampusResponse } from 'common/dto/room/CampusResponse.dto';
import flatMap from 'lodash.flatmap';
import { LocationService } from '../location.service';
import { metadata } from '../../../common/__tests__/data/metadata';
import { Campus } from '../campus.entity';
import { Room } from '../room.entity';
import { RoomBookingInfoView } from '../RoomBookingInfoView.entity';
import { RoomListingView } from '../RoomListingView.entity';

describe('Location service', function () {
  let locationService: LocationService;
  let mockLocationQueryBuilder
  : SinonStubbedInstance<SelectQueryBuilder<CampusResponse>>;
  let mockRoomListingViewRepository: Record<string, SinonStub>;
  let mockRoomBookingRepository: Record<string, SinonStub>;
  let mockRoomRepository: Record<string, SinonStub>;
  let mockCampusRepository: Record<string, SinonStub>;

  beforeEach(async function () {
    mockLocationQueryBuilder = createStubInstance(SelectQueryBuilder);
    mockLocationQueryBuilder.leftJoinAndSelect.returnsThis();
    mockLocationQueryBuilder.orderBy.returnsThis();
    mockLocationQueryBuilder.addOrderBy.returnsThis();
    mockLocationQueryBuilder.getMany.resolves(metadata.campuses);

    mockRoomListingViewRepository = {
      find: stub(),
      createQueryBuilder: stub().returns(mockLocationQueryBuilder),
    };

    mockRoomBookingRepository = {
      createQueryBuilder: stub().returns(mockLocationQueryBuilder),
    };

    mockRoomRepository = {
      find: stub(),
      save: stub(),
      createQueryBuilder: stub().returns(mockLocationQueryBuilder),
    };

    mockCampusRepository = {
      createQueryBuilder: stub().returns(mockLocationQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: getRepositoryToken(RoomListingView),
          useValue: mockRoomListingViewRepository,
        },
        {
          provide: getRepositoryToken(RoomBookingInfoView),
          useValue: mockRoomBookingRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository,
        },
        {
          provide: getRepositoryToken(Campus),
          useValue: mockCampusRepository,
        },
      ],
      controllers: [],
    }).compile();

    locationService = module.get<LocationService>(LocationService);
  });
  describe('getCampusMetadata', function () {
    context('When there are records in the database', function () {
      beforeEach(function () {
        mockLocationQueryBuilder.leftJoinAndSelect.returnsThis();
        mockLocationQueryBuilder.orderBy.returnsThis();
        mockLocationQueryBuilder.addOrderBy.returnsThis();
        mockLocationQueryBuilder.getMany.resolves(metadata.campuses);
      });
      it('should return all campuses', async function () {
        const result = await locationService.getCampusMetadata();
        const actualCampuses = result.map((campus) => campus.name);
        const expectedCampuses = metadata.campuses
          .map((campus) => campus.name).sort();
        deepStrictEqual(actualCampuses, expectedCampuses);
      });
      it('should return all buildings', async function () {
        const result = await locationService.getCampusMetadata();
        const actualBuildings = flatMap(result
          .map((campus) => campus.buildings)
          .map((buildings) => buildings
            .map((building) => building.name))).sort();
        const expectedBuildings = flatMap(metadata.campuses
          .map((campus) => campus.buildings)
          .map((buildings) => buildings
            .map((building) => building.name))).sort();
        deepStrictEqual(actualBuildings, expectedBuildings);
      });
      it('should return all rooms', async function () {
        const result = await locationService.getCampusMetadata();
        const actualRooms = flatMap(result
          .map((campus) => campus.buildings)
          .map((buildings) => buildings
            .map((building) => building.rooms
              .map((room) => room.name)))).sort();
        const expectedRooms = flatMap(metadata.campuses
          .map((campus) => campus.buildings)
          .map((buildings) => buildings
            .map((building) => building.rooms
              .map((room) => room.name)))).sort();
        deepStrictEqual(actualRooms, expectedRooms);
      });
    });
    context('When there are no records in the database', function () {
      beforeEach(function () {
        mockLocationQueryBuilder.leftJoinAndSelect.returnsThis();
        mockLocationQueryBuilder.orderBy.returnsThis();
        mockLocationQueryBuilder.addOrderBy.returnsThis();
        mockLocationQueryBuilder.getMany.resolves([]);
      });
      it('should return an empty array', async function () {
        const result = await locationService.getCampusMetadata();
        deepStrictEqual(result, []);
      });
    });
  });
});
