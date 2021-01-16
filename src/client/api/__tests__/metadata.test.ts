import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import {
  stub,
  SinonStub,
} from 'sinon';
import {
  rawAreaList,
  rawSemesterList,
  error,
  rawCatalogPrefixList,
} from 'testData';
import { MetadataAPI } from 'client/api/metadata';
import {
  strictEqual,
  deepStrictEqual,
  fail,
} from 'assert';
import request, {
  AxiosResponse,
} from '../request';

describe('Metadata API', function () {
  let result: MetadataResponse;
  let getStub: SinonStub;
  describe('GET /metadata', function () {
    beforeEach(function () {
      getStub = stub(request, 'get');
    });
    afterEach(function () {
      getStub.restore();
    });
    describe('gets all metadata', function () {
      context('when data fetch succeeds', function () {
        beforeEach(async function () {
          getStub.resolves({
            data: {
              currentAcademicYear: 2021,
              areas: rawAreaList.map((area) => area.name),
              semesters: rawSemesterList
                .map(({ term, year }): string => `${term} ${year}`),
              catalogPrefixes: rawCatalogPrefixList
                .map((prefix) => prefix.name),
            },
          } as AxiosResponse<MetadataResponse>);
          result = await MetadataAPI.getMetadata();
        });
        it('should call getMetadata', function () {
          strictEqual(getStub.callCount, 1);
        });
        it('should call request /api/metadata/', function () {
          const [[path]] = getStub.args;
          strictEqual(path, '/api/metadata/');
        });
        it('should return the metadata', function () {
          deepStrictEqual(result,
            {
              currentAcademicYear: 2021,
              areas: rawAreaList.map((area) => area.name),
              semesters: rawSemesterList
                .map(({ term, year }): string => `${term} ${year}`),
              catalogPrefixes: rawCatalogPrefixList
                .map((prefix) => prefix.name),
            });
        });
      });
      context('when data fetch fails', function () {
        beforeEach(function () {
          getStub.rejects();
        });
        it('should throw an error', async function () {
          try {
            await MetadataAPI.getMetadata();
            fail('Did not throw an error');
          } catch (err) {
            deepStrictEqual(err, error);
          }
        });
      });
    });
  });
});
