import React from 'react';
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
import { SinonStub, stub } from 'sinon';
import { render } from 'test-utils';
import {
  am105CourseInstance,
  cs50CourseInstance,
  es095CourseInstance,
} from 'testData';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';
import { TERM } from 'common/constants';

describe('Meeting Modal Focus Behavior', function () {
  let getStub: SinonStub;
  let findByText: BoundFunction<FindByText>;
  let queryByText: BoundFunction<QueryByText>;
  const dispatchStub: SinonStub = stub();
  const testData = [
    es095CourseInstance,
    cs50CourseInstance,
    am105CourseInstance,
  ];
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getCourseInstancesForYear');
    getStub.resolves(testData);
  });
  describe('On Open Behavior', function () {
    beforeEach(async function () {
      ({ findByText } = render(
        <CoursesPage />,
        dispatchStub
      ));
      const editCS50MeetingButton = await waitForElement(
        () => document.getElementById(`${cs50CourseInstance.id}-${cs50CourseInstance.termPattern}-edit-meetings-button`)
      );
      fireEvent.click(editCS50MeetingButton);
      await findByText(/Meetings for/);
    });
    it('sets the focus to the meeting modal header', function () {
      strictEqual(
        (document.activeElement as HTMLElement)
          .textContent.includes(cs50CourseInstance.catalogNumber),
        true
      );
    });
  });
  describe('On Close Behavior', function () {
    let editFallES095MeetingButton: HTMLElement;
    let editSpringES095MeetingButton: HTMLElement;
    beforeEach(async function () {
      ({ findByText, queryByText } = render(
        <CoursesPage />,
        dispatchStub
      ));
      editFallES095MeetingButton = await waitForElement(
        () => document.getElementById(`${es095CourseInstance.id}-${TERM.FALL}-edit-meetings-button`)
      );
      fireEvent.click(editFallES095MeetingButton);
      await findByText(/Meetings for/);
      const cancelButton = await findByText(/Cancel/);
      fireEvent.click(cancelButton);
      await wait(() => !queryByText(/Meetings for/));
      editSpringES095MeetingButton = document
        .getElementById(`${es095CourseInstance.id}-${TERM.SPRING}-edit-meetings-button`);
    });
    it('returns focus to the originally clicked edit meeting button', function () {
      strictEqual(
        document.activeElement as HTMLElement,
        editFallES095MeetingButton
      );
      notStrictEqual(
        document.activeElement as HTMLElement,
        editSpringES095MeetingButton
      );
    });
  });
});
