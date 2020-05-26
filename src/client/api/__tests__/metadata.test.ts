import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import {
  stub,
  SinonStub,
} from 'sinon';
import request, {
  AxiosResponse,
} from 'axios';
import {
  rawAreaList,
  rawSemesterList,
  error,
} from 'testData';
import * as api from 'client/api';
import {
  strictEqual,
  deepStrictEqual,
  fail,
} from 'assert';

describe('Metadata API', function () {
  let result: MetadataResponse;
  let getStub: SinonStub;
  describe('GET /metadata', function () {
    beforeEach(async function () {
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
            },
          } as AxiosResponse<MetadataResponse>);
          result = await api.getMetadata();
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
              academicYear: 2021,
              areas: rawAreaList.map((area) => area.name),
              semesters: rawSemesterList
                .map(({ term, year }): string => `${term} ${year}`),
            });
        });
      });
      context('when data fetch fails', function () {
        beforeEach(async function () {
          getStub.rejects();
        });
        it('should throw an error', async function () {
          try {
            await api.getMetadata();
            fail('Did not throw an error');
          } catch (err) {
            deepStrictEqual(err, error);
          }
        });
      });
    });
  });
});
