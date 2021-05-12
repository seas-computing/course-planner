import { ConfigService } from 'server/config/config.service';
import { TestingModule, Test } from '@nestjs/testing';
import { stub } from 'sinon';
import { strictEqual, deepStrictEqual } from 'assert';
import { year } from 'testData';
import {
  computationalModelingofFluidsReadingGroup,
  dataScienceReadingGroup,
} from 'common/__tests__/data/nonClassEvents';
import { NonClassEventController } from '../nonClassEvent.controller';
import { NonClassEventService } from '../nonClassEvent.service';

const mockNonClassEventService = {
  find: stub(),
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
  });
});
