import { SinonStub, stub } from 'sinon';
import { Test } from '@nestjs/testing';
import { SemesterService } from 'server/semester/semester.service';
import { AreaService } from 'server/area/area.service';
import { ConfigService } from 'server/config/config.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authentication } from 'server/auth/authentication.guard';
import {
  metadata,
  rawAreaList,
  rawCatalogPrefixList,
  rawSemesterList,
} from 'testData';
import { strictEqual } from 'assert';
import { Area } from 'server/area/area.entity';
import { Semester } from 'server/semester/semester.entity';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import { CourseService } from 'server/course/course.service';
import { Course } from 'server/course/course.entity';
import { LocationService } from 'server/location/location.service';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { RoomBookingInfoView } from 'server/location/RoomBookingInfoView.entity';
import { Room } from 'server/location/room.entity';
import { Campus } from 'server/location/campus.entity';
import { MetadataController } from '../metadata.controller';

describe('Metadata Controller', function () {
  let mdController: MetadataController;
  let configService: ConfigService;
  let getSemesterListStub: SinonStub;
  let findAreaStub: SinonStub;
  let getCatalogPrefixListStub: SinonStub;
  let getCampusMetadataStub: SinonStub;
  const mockRepository: Record<string, SinonStub> = {};
  beforeEach(async function () {
    getSemesterListStub = stub();
    findAreaStub = stub();
    getCatalogPrefixListStub = stub();
    getCampusMetadataStub = stub();
    const testModule = await Test.createTestingModule({
      controllers: [MetadataController],
      providers: [
        {
          provide: AreaService,
          useValue: {
            getAreaList: findAreaStub,
          },
        },
        {
          provide: SemesterService,
          useValue: {
            getSemesterList: getSemesterListStub,
          },
        },
        {
          provide: CourseService,
          useValue: {
            getCatalogPrefixList: getCatalogPrefixListStub,
          },
        },
        {
          provide: LocationService,
          useValue: {
            getCampusMetadata: getCampusMetadataStub,
          },
        },
        {
          provide: getRepositoryToken(Area),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Semester),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(RoomListingView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(RoomBookingInfoView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Campus),
          useValue: mockRepository,
        },
        ConfigService,
      ],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .compile();

    mdController = testModule
      .get<MetadataController>(MetadataController);
    configService = testModule
      .get<ConfigService>(ConfigService);
  });
  describe('/api/metadata/', function () {
    describe('Get all metadata', function () {
      let metadataResponse: MetadataResponse;
      const expectedAcademicYear = 2021;
      const expectedAreas = rawAreaList.map((area) => area.name);
      const expectedSemesters = rawSemesterList
        .map(({ term, year }): string => `${term} ${year}`);
      const expectedCatalogPrefixes = rawCatalogPrefixList
        .map((record) => record.prefix);
      beforeEach(async function () {
        stub(configService, 'academicYear')
          .get(() => expectedAcademicYear);
        findAreaStub.resolves(expectedAreas);
        getSemesterListStub.resolves(expectedSemesters);
        getCatalogPrefixListStub.resolves(expectedCatalogPrefixes);
        getCampusMetadataStub.resolves(metadata.campuses);
        metadataResponse = await mdController.getMetadata();
      });
      it('should return the correct academic year', function () {
        strictEqual(metadataResponse.currentAcademicYear, expectedAcademicYear);
      });
      it('should return the correct areas', function () {
        strictEqual(findAreaStub.callCount, 1);
        strictEqual(metadataResponse.areas, expectedAreas);
      });
      it('should return the correct semesters', function () {
        strictEqual(getSemesterListStub.callCount, 1);
        strictEqual(metadataResponse.semesters, expectedSemesters);
      });
      it('should return the correct catalog prefixes', function () {
        strictEqual(getCatalogPrefixListStub.callCount, 1);
        strictEqual(metadataResponse.catalogPrefixes, expectedCatalogPrefixes);
      });
      it('should return the correct campuses', function () {
        strictEqual(getCampusMetadataStub.callCount, 1);
        strictEqual(metadataResponse.campuses, metadata.campuses);
      });
    });
  });
});
