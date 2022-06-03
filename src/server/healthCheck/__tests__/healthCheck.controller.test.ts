import { stub } from 'sinon';
import { strictEqual } from 'assert';
import { TestingModule, Test } from '@nestjs/testing';
import { HealthCheckController } from '../healthCheck.controller';
import { ConfigService } from '../../config/config.service';
import { ConfigModule } from '../../config/config.module';

describe('Health Check controller', function () {
  let controller: HealthCheckController;
  let fakeConfigService: ConfigService;

  beforeEach(async function () {
    fakeConfigService = new ConfigService({});
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [HealthCheckController],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfigService)
      .compile();
    controller = moduleRef.get<HealthCheckController>(HealthCheckController);
  });

  describe('getHealthCheck', function () {
    it('returns an OK status', function () {
      const result = controller.getHealthCheck();
      strictEqual(result.status, 'OK');
    });
    context('With no .dockerversion file', function () {
      it('Returns a blank version field', function () {
        stub(fakeConfigService, 'buildVersion').get(() => '');
        const result = controller.getHealthCheck();
        strictEqual(result.version, '');
      });
    });
    context('With a .dockerversion file', function () {
      it('Returns the version', function () {
        const fakeVersion = 'v1.0.0';
        stub(fakeConfigService, 'buildVersion').get(() => fakeVersion);
        const result = controller.getHealthCheck();
        strictEqual(result.version, fakeVersion);
      });
    });
  });
});
