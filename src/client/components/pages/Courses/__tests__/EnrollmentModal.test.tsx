import {
  fireEvent,
  RenderResult,
} from '@testing-library/react';
import React from 'react';
import {
  SinonStub,
  stub,
} from 'sinon';
import { render } from 'test-utils';
import { cs50CourseInstance } from 'testData';
import request from 'client/api/request';
import { HTTP_STATUS } from 'client/api';
import { TERM } from 'common/constants';
import { AxiosResponse } from 'axios';
import EnrollmentModal from '../EnrollmentModal';

describe('Enrollment Modal', function () {
  let modal: RenderResult;
  const testData = cs50CourseInstance;
  let putStub: SinonStub;
  let saveStub: SinonStub;
  let closeStub: SinonStub;
  describe('Saving', function () {
    beforeEach(function () {
      putStub = stub(request, 'put');
      saveStub = stub();
      closeStub = stub();
      putStub.resolves({ data: testData });
      modal = render(
        <EnrollmentModal
          course={testData}
          currentSemester={{
            calendarYear: testData.spring.calendarYear,
            term: TERM.SPRING,
          }}
          onClose={closeStub}
          onSave={saveStub}
          isVisible
        />
      );
    });
    it('reports server-side validation errors', function () {
      // Set the fake API up to reject
      putStub.rejects({
        response: {
          status: HTTP_STATUS.BAD_REQUEST,
          data: {
            statusCode: HTTP_STATUS.BAD_REQUEST,
            error: 'Bad Request',
            message: [
              {
                property: 'studyCardEnrollment',
                constraints: { min: 'studyCardEnrollment must not be less than 0' },
              },
            ],
          },
        } as Partial<AxiosResponse>,
      });
      fireEvent.click(modal.getByText('Save'));

      return modal.findByText(/must not be less than 0/);
    });
    it('reports misc internal server errors', function () {
      // Set the fake API up to reject
      putStub.rejects({
        response: {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          data: {
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
          },
        } as Partial<AxiosResponse>,
      });
      fireEvent.click(modal.getByText('Save'));

      return modal.findByText(/please contact SEAS Computing/);
    });
  });
});
