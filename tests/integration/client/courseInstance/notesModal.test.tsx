import { CourseAPI } from 'client/api';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import React from 'react';
import { SinonStub, stub } from 'sinon';
import {
  render,
  RenderResult,
  waitForElement,
  fireEvent,
  waitForElementToBeRemoved,
} from 'test-utils';
import { cs50CourseInstance } from 'testData';

describe('Notes modal', function () {
  let getStub: SinonStub;
  const testData: CourseInstanceResponseDTO[] = [
    {
      ...cs50CourseInstance,
      fall: {
        ...cs50CourseInstance.fall,
        calendarYear: '2019',
      },
      spring: {
        ...cs50CourseInstance.spring,
        calendarYear: '2020',
      },
    },
  ];
  let page: RenderResult;

  beforeEach(async function () {
    getStub = stub(CourseAPI, 'getCourseInstancesForYear');
    getStub.resolves(testData);

    page = render(<CoursesPage />);
    await waitForElementToBeRemoved(
      () => page.getByText('fetching', { exact: false })
    );
    const button = await waitForElement(
      () => page.findByLabelText('notes', { exact: false })
    );
    fireEvent.click(button);
  });
  it('opens when the notes button is clicked beside a course', function () {
    return page.getByRole('dialog');
  });
});
