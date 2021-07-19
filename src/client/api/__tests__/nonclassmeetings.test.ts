import {
  stub,
  SinonStub,
} from 'sinon';
import * as dummy from 'testData';
import {
  strictEqual,
  deepStrictEqual,
  fail,
} from 'assert';
import NonClassMeetingResponseDTO from 'common/dto/nonClassMeetings/NonClassMeeting.dto';
import {
  computationalModelingofFluidsReadingGroup,
  dataScienceReadingGroup,
} from 'testData';
import request, {
  AxiosResponse,
} from '../request';
import { NonClassMeetingApi } from '../nonClassMeeting';

describe('Non-class meeting API', function () {
  let result: Record<string, NonClassMeetingResponseDTO[]>;
  let getStub: SinonStub;
  describe('getNonClassMeetings', function () {
    beforeEach(function () {
      getStub = stub(request, 'get');
    });
    context('when data fetch succeeds', function () {
      beforeEach(async function () {
        getStub.resolves({
          status: 200,
          statusText: 'OK',
          headers: '',
          config: {},
          data: {
            [dataScienceReadingGroup.spring.academicYear]: [
              dataScienceReadingGroup,
              computationalModelingofFluidsReadingGroup,
            ],
          },
        } as AxiosResponse<Record<string, NonClassMeetingResponseDTO[]>>);
        result = await NonClassMeetingApi.getNonClassMeetings();
      });
      it('should call getNonClassMeetings', function () {
        strictEqual(getStub.callCount, 1);
      });
      it('should request api/non-class-events', function () {
        const [[path]] = getStub.args;
        strictEqual(path, 'api/non-class-events');
      });
      it('should return the non-class events', function () {
        deepStrictEqual(
          result,
          {
            [dataScienceReadingGroup.spring.academicYear]: [
              dataScienceReadingGroup,
              computationalModelingofFluidsReadingGroup,
            ],
          }
        );
      });
    });
    context('when data fetch fails', function () {
      beforeEach(function () {
        getStub.rejects(dummy.error);
      });
      it('should throw an error', async function () {
        try {
          await NonClassMeetingApi.getNonClassMeetings();
          fail('Did not throw an error');
        } catch (err) {
          deepStrictEqual(err, dummy.error);
        }
      });
    });
  });
});
