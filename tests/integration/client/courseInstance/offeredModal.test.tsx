import {
  BoundFunction,
  FindByText,
  fireEvent,
  QueryByText,
  wait,
  waitForElement,
} from '@testing-library/react';
import { notStrictEqual, strictEqual } from 'assert';
import { CourseAPI } from 'client/api';
import { SinonStub, stub, spy } from 'sinon';
import { render } from 'test-utils';
import { cs50CourseInstance } from 'testData';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';
import { TERM } from 'common/constants';
import React from 'react';
import { MetadataContextValue } from 'client/context';
import * as dummy from 'testData';
import { TermKey } from 'common/constants/term';

describe('Offered Modal Behavior', function () {
  let getInstancesStub: SinonStub;
  let metadataContext: MetadataContextValue;
  let findByText: BoundFunction<FindByText>;
  let findByLabelText: BoundFunction<FindByText>;
  let queryByText: BoundFunction<QueryByText>;
  let editCS50FallOfferedButton: HTMLElement;
  let editCS50SpringOfferedButton: HTMLElement;
  const testData = [cs50CourseInstance];
  const currentAcademicYear = 2018;
  const testTerm = TERM.FALL;
  const semKey = testTerm.toLowerCase() as TermKey;
  beforeEach(function () {
    getInstancesStub = stub(CourseAPI, 'getCourseInstancesForYear');
    getInstancesStub.resolves(testData);
    metadataContext = new MetadataContextValue({
      ...dummy.metadata,
      currentAcademicYear,
      semesters: [
        `${TERM.FALL} 2017`,
        `${TERM.SPRING} 2018`,
        `${TERM.FALL} 2018`,
        `${TERM.SPRING} 2019`,
        `${TERM.FALL} 2019`,
        `${TERM.SPRING} 2020`,
        `${TERM.FALL} 2020`,
        `${TERM.SPRING} 2021`,
        `${TERM.FALL} 2021`,
        `${TERM.SPRING} 2022`,
      ],
    },
    spy());
  });
  describe('On Open Behavior', function () {
    beforeEach(async function () {
      ({ findByLabelText, findByText } = render(
        <CoursesPage />,
        { metadataContext }
      ));
      editCS50FallOfferedButton = await waitForElement(
        () => findByLabelText(`Edit offered value for ${cs50CourseInstance.catalogNumber}, ${testTerm} ${cs50CourseInstance[semKey].calendarYear}`)
      );
      fireEvent.click(editCS50FallOfferedButton);
      await findByText(/Edit Offered Value for/);
    });
    it('sets the focus to the offered modal header', function () {
      strictEqual(
        (document.activeElement as HTMLElement)
          .textContent.includes(cs50CourseInstance.catalogNumber),
        true
      );
    });
  });
  describe('On Close Behavior', function () {
    beforeEach(async function () {
      ({ findByLabelText, findByText, queryByText } = render(
        <CoursesPage />,
        { metadataContext }
      ));
      editCS50FallOfferedButton = await waitForElement(
        () => findByLabelText(`Edit offered value for ${cs50CourseInstance.catalogNumber}, ${testTerm} ${cs50CourseInstance[semKey].calendarYear}`)
      );
      editCS50SpringOfferedButton = await waitForElement(
        () => findByLabelText(`Edit offered value for ${cs50CourseInstance.catalogNumber}, ${TERM.SPRING} ${cs50CourseInstance.spring.calendarYear}`)
      );
      fireEvent.click(editCS50FallOfferedButton);
      // Wait to see the modal header
      await findByText(/Edit Offered Value for/);
      const cancelButton = await findByText(/Cancel/);
      fireEvent.click(cancelButton);
      // Wait for the modal to close
      await wait(() => !queryByText(/Edit Offered Value for/));
    });
    it('returns focus to the originally clicked edit meeting button', function () {
      strictEqual(
        document.activeElement as HTMLElement,
        editCS50FallOfferedButton
      );
      notStrictEqual(
        document.activeElement as HTMLElement,
        editCS50SpringOfferedButton
      );
    });
  });
});
