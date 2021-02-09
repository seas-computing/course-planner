import { strictEqual } from 'assert';
import { TestingModule, Test } from '@nestjs/testing';
import { HealthCheckController } from '../healthCheck.controller';

describe('Health Check controller', function () {
  let controller: HealthCheckController;

  beforeEach(async function () {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
    })
      .compile();
    controller = moduleRef.get<HealthCheckController>(HealthCheckController);
  });

  describe('getHealthCheck', function () {
    it('returns an OK status', function () {
      const result = controller.getHealthCheck();
      strictEqual(result.status, 'OK');
    });
  });
});
