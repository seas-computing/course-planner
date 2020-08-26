import {
  createStubInstance,
  SinonStubbedInstance,
  SinonStub,
  stub,
} from 'sinon';
import { SelectQueryBuilder } from 'typeorm';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { rawAreaList } from 'common/data';
import {
  strictEqual,
  deepStrictEqual,
} from 'assert';
import { AreaService } from '../area.service';
import { Area } from '../area.entity';

describe('Area Service', function () {
  let areaService: AreaService;
  let mockAreaRepository: Record<string, SinonStub>;
  let mockAreaQueryBuilder: SinonStubbedInstance<
  SelectQueryBuilder<Area>
  >;

  beforeEach(async function () {
    mockAreaQueryBuilder = createStubInstance(SelectQueryBuilder);
    mockAreaRepository = {};
    mockAreaRepository.createQueryBuilder = stub()
      .returns(mockAreaQueryBuilder);
    const testModule = await Test.createTestingModule({
      providers: [
        AreaService,
        {
          provide: getRepositoryToken(Area),
          useValue: mockAreaRepository,
        },
        AreaService,
      ],
    }).compile();
    areaService = testModule.get<AreaService>(AreaService);
  });
  describe('find', function () {
    context('When there are records in the database', function () {
      beforeEach(function () {
        mockAreaQueryBuilder.select.returnsThis();
        mockAreaQueryBuilder.distinct.returnsThis();
        mockAreaQueryBuilder.orderBy.returnsThis();
        mockAreaQueryBuilder.getRawMany.resolves(rawAreaList);
      });
      it('returns a list of just the areas', async function () {
        const result = await areaService.getAreaList();
        const areaArray = rawAreaList.map((area) => area.name);
        strictEqual(result.length, rawAreaList.length);
        deepStrictEqual(result, areaArray);
      });
    });
    context('When there are no records in the database', function () {
      beforeEach(function () {
        mockAreaQueryBuilder.select.returnsThis();
        mockAreaQueryBuilder.distinct.returnsThis();
        mockAreaQueryBuilder.orderBy.returnsThis();
        mockAreaQueryBuilder.getRawMany.resolves([]);
      });
      it('returns an empty array', async function () {
        const result = await areaService.getAreaList();
        strictEqual(result.length, 0);
        deepStrictEqual(result, []);
      });
    });
  });
});
