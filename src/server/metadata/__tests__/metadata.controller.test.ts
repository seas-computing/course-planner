import { SinonStub, stub } from 'sinon';
import { Test } from '@nestjs/testing';
import { SemesterService } from 'server/semester/semester.service';
import { AreaService } from 'server/area/area.service';
import { ConfigService } from 'server/config/config.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authentication } from 'server/auth/authentication.guard';
import { rawAreaList, rawCatalogPrefixList, rawSemesterList } from 'testData';
import { strictEqual } from 'assert';
import { Area } from 'server/area/area.entity';
import { Semester } from 'server/semester/semester.entity';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import { CourseService } from 'server/course/course.service';
import { Course } from 'server/course/course.entity';
import { MetadataController } from '../metadata.controller';

describe('Metadata Controller', function () {
  let mdController: MetadataController;
  let configService: ConfigService;
  let getSemesterListStub: SinonStub;
  let findAreaStub: SinonStub;
  let getCatalogPrefixListStub: SinonStub;
  const mockRepository: Record<string, SinonStub> = {};
  beforeEach(async function () {
    getSemesterListStub = stub();
    findAreaStub = stub();
    getCatalogPrefixListStub = stub();
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
      let metadata: MetadataResponse;
      const expectedAcademicYear = 2021;
      const expectedAreas = rawAreaList.map((area) => area.name);
      const expectedSemesters = rawSemesterList
        .map(({ term, year }): string => `${term} ${year}`);
      const expectedCatalogPrefixes = rawCatalogPrefixList
        .map((prefix) => prefix.name);
      beforeEach(async function () {
        stub(configService, 'academicYear')
          .get(() => expectedAcademicYear);
        findAreaStub.resolves(expectedAreas);
        getSemesterListStub.resolves(expectedSemesters);
        getCatalogPrefixListStub.resolves(expectedCatalogPrefixes);
        metadata = await mdController.getMetadata();
      });
      it('should return the correct academic year', function () {
        strictEqual(metadata.currentAcademicYear, expectedAcademicYear);
      });
      it('should return the correct areas', function () {
        strictEqual(findAreaStub.callCount, 1);
        strictEqual(metadata.areas, expectedAreas);
      });
      it('should return the correct semesters', function () {
        strictEqual(getSemesterListStub.callCount, 1);
        strictEqual(metadata.semesters, expectedSemesters);
      });
      it('should return the correct catalog prefixes', function () {
        strictEqual(getCatalogPrefixListStub.callCount, 1);
        strictEqual(metadata.catalogPrefixes, expectedCatalogPrefixes);
      });
    });
  });
});
