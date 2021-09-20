import { ConfigService } from 'server/config/config.service';
import { TestingModule, Test } from '@nestjs/testing';
import { stub } from 'sinon';
import {
  strictEqual, deepStrictEqual, rejects,
} from 'assert';
import { rawAreaList, year, createNonClassParent } from 'testData';
import {
  computationalModelingofFluidsReadingGroup,
  dataScienceReadingGroup,
} from 'common/__tests__/data/nonClassEvents';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Area } from 'server/area/area.entity';
import { BadRequestException } from '@nestjs/common';
import { NonClassEventService } from '../nonClassEvent.service';
import { NonClassEventController } from '../nonClassEvent.controller';

const mockNonClassEventService = {
  find: stub(),
  createWithNonClassEvents: stub(),
};

const mockAreaRepository = {
  findOne: stub(),
};

describe('NonClassEvent controller', function () {
  let controller: NonClassEventController;
  let configService: ConfigService;

  beforeEach(async function () {
    const testModule: TestingModule = await Test.createTestingModule({
      controllers: [NonClassEventController],
      providers: [
        ConfigService,
        {
          provide: NonClassEventService,
          useValue: mockNonClassEventService,
        },
        {
          provide: getRepositoryToken(Area),
          useValue: mockAreaRepository,
        },
      ],
    })
      .compile();
    controller = testModule
      .get<NonClassEventController>(NonClassEventController);
    configService = testModule
      .get<ConfigService>(ConfigService);
  });
  afterEach(function () {
    mockNonClassEventService.find.resetHistory();
  });
  describe('find', function () {
    it('retrieves all results for the specified academic year', async function () {
      mockNonClassEventService.find.resolves([]);

      await controller.find(year);

      strictEqual(mockNonClassEventService.find.args[0][0], year);
    });
    it('defaults to the current academic year if one was not specified', async function () {
      // A ridiculously out of date value, that couldn't be generated by an
      // off-by-one error
      const currentAcdemicYear = 2012;
      mockNonClassEventService.find.resolves([]);
      stub(configService, 'academicYear').get(() => currentAcdemicYear);

      await controller.find();

      strictEqual(mockNonClassEventService.find.args[0][0], currentAcdemicYear);
    });
    it('returns all the NonClassEvent records in the database', async function () {
      const mockData = [
        dataScienceReadingGroup,
        computationalModelingofFluidsReadingGroup,
      ];
      mockNonClassEventService.find.resolves(mockData);

      const results = await controller.find();

      deepStrictEqual(
        Object.values(results)
          .reduce((acc, val) => acc.concat(val), []),
        mockData
      );
    });
    it('groups NonClassParents by academic year', async function () {
      const {
        spring: springSemester,
      } = computationalModelingofFluidsReadingGroup;

      const mockData = [
        dataScienceReadingGroup,
        {
          ...computationalModelingofFluidsReadingGroup,
          spring: {
            ...springSemester,
            academicYear: (
              parseInt(springSemester.calendarYear, 10) + 2
            ).toString(),
          },
        },
      ];
      mockNonClassEventService.find.resolves(mockData);

      const results = await controller.find();

      deepStrictEqual(
        Object.keys(results),
        [...new Set(mockData.map(({ spring }) => spring.calendarYear))]
      );
    });
  });
  describe('create', function () {
    it('creates non class parents within an existing area', async function () {
      const mockArea = rawAreaList[0];
      mockAreaRepository.findOne.resolves(mockArea);

      await controller.create(createNonClassParent);

      strictEqual(
        mockNonClassEventService.createWithNonClassEvents.args[0][0].area,
        mockArea
      );
    });
    it('throws BadRequestException for an invalid area', function () {
      mockAreaRepository.findOne.resolves(null);

      void rejects(() => controller.create({
        ...createNonClassParent,
        area: 'I don\'t exist',
      }), BadRequestException);
    });
  });
});
