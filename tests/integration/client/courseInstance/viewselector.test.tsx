import React from 'react';
import { render } from 'test-utils';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';

describe('View selection dropdown', function () {
  let coursePage: ReturnType<typeof render>;

  beforeEach(function () {
    coursePage = render(<CoursesPage />);
  });
  it('defaults to the default view', async function () {
    return coursePage.findByDisplayValue(/Default/, { exact: false });
  });
});
