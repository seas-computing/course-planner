import React from 'react';
import { render } from 'test-utils';
import {
  fireEvent,
  waitForElement,
  RenderResult,
} from '@testing-library/react';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';
import {
  physicsCourseResponse,
} from 'testData';
import { CourseAPI } from 'client/api';
import { stub } from 'sinon';

describe('View modal', function () {
  let coursePage: RenderResult;
  beforeEach(function () {
    stub(CourseAPI, 'getAllCourses').resolves([physicsCourseResponse]);
    coursePage = render(<CoursesPage />);
  });
  it('appears when the "Customize View" button is clicked', function () {
    return waitForElement(() => {
      const button = coursePage.getByText('Customize View', { exact: false });
      fireEvent.click(button);
      return coursePage.queryByRole('dialog');
    });
  });
});
