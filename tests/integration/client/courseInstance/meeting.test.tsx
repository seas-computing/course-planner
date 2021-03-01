import React from 'react';
import {
  BoundFunction,
  FindByText,
  fireEvent,
  QueryByText,
  wait,
  waitForElement,
} from '@testing-library/react';
import { strictEqual } from 'assert';
import { CourseAPI } from 'client/api';
import { SinonStub, stub } from 'sinon';
import { render } from 'test-utils';
import { cs50CourseInstance, es095CourseInstance } from 'testData';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';

describe('Meeting Modal Focus Behavior', function () {
  let getStub: SinonStub;
  let findByText: BoundFunction<FindByText>;
  let queryByText: BoundFunction<QueryByText>;
  const dispatchStub: SinonStub = stub();
  const testData = [
    es095CourseInstance,
    cs50CourseInstance,
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
      await findByText(/Rooms for/);
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
    let editCS50MeetingButton: HTMLElement;
    beforeEach(async function () {
      ({ findByText, queryByText } = render(
        <CoursesPage />,
        dispatchStub
      ));
      editCS50MeetingButton = await waitForElement(
        () => document.getElementById(`${cs50CourseInstance.id}-${cs50CourseInstance.termPattern}-edit-meetings-button`)
      );
      fireEvent.click(editCS50MeetingButton);
      await findByText(/Rooms for/);
      const cancelButton = await findByText(/Cancel/);
      fireEvent.click(cancelButton);
      await wait(() => !queryByText(/Rooms for/));
    });
    it('returns focus to the originally clicked edit meeting button', function () {
      strictEqual(
        document.activeElement as HTMLElement,
        editCS50MeetingButton
      );
    });
  });
});
