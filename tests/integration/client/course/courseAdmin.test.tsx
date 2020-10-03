import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  waitForElement,
  wait,
  fireEvent,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import {
  physicsCourseResponse,
  computerScienceCourseResponse,
} from 'testData';
import { CourseAPI } from 'client/api/courses';
import { render } from 'test-utils';
import CourseAdmin from 'client/components/pages/CourseAdmin';

describe('Course Admin Modal Behavior', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  const testData = [
    physicsCourseResponse,
    computerScienceCourseResponse,
  ];
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getAllCourses');
    getStub.resolves(testData);
    dispatchMessage = stub();
  });
  describe('rendering', function () {
    context('when the create course button is clicked and the modal is up', function () {
      context('when the modal is closed', function () {
        it('returns focus to the create course button', async function () {
          const { findByText, queryByText } = render(
            <CourseAdmin />,
            dispatchMessage
          );
          // Show the create course modal
          const createCourseButton = await findByText('Create New Course', { exact: false });
          fireEvent.click(createCourseButton);
          await findByText(/required field/);
          const cancelButton = await findByText(/Cancel/);
          // Close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText(/required field/));
          strictEqual(
            document.activeElement as HTMLElement,
            createCourseButton
          );
        });
      });
    });
    context('when an edit course button has been clicked and the modal is up', function () {
      context('when the modal is closed', function () {
        it('returns focus to the originally clicked edit faculty button', async function () {
          const { findByText, queryByText } = render(
            <CourseAdmin />,
            dispatchMessage
          );
          // Show the edit course modal
          const editCourseButton = await waitForElement(
            () => document.getElementById('editCourse' + physicsCourseResponse.id)
          );
          fireEvent.click(editCourseButton);
          await findByText(/required field/);
          const cancelButton = await findByText(/Cancel/);
          // Close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText(/required field/));
          strictEqual(
            document.activeElement as HTMLElement,
            editCourseButton
          );
        });
      });
    });
  });
});
