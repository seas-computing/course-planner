import { ConfigService } from 'server/config/config.service';
import { TestingModule, Test } from '@nestjs/testing';
import { stub } from 'sinon';
import { strictEqual } from 'assert';
import { year } from 'testData';
import { NonClassEventController } from '../nonClassEvent.controller';
import { NonClassEventService } from '../nonClassEvent.service';

const mockNonClassEventService = {
  find: stub(),
};

describe('NonClassEvent controller', function () {
  let controller: NonClassEventController;

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
  });
  describe('find', function () {
    it('retrieves all results for the specified academic year', async function () {
      mockNonClassEventService.find.resolves();

      await controller.find(year);

      strictEqual(mockNonClassEventService.find.args[0][0], year);
    });
  });
});
