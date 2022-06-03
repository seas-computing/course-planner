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
import { TERM } from 'common/constants';
import { HttpStatus } from '@nestjs/common';
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
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: [
              {
                property: 'studyCardEnrollment',
                constraints: { min: 'studyCardEnrollment must not be less than 0' },
              },
            ],
          },
        },
      });
      fireEvent.click(modal.getByText('Save'));

      return modal.findByText('must not be less than 0');
    });
  });
});
