import {
  BoundFunction,
  fireEvent,
  GetByText,
  QueryByText,
  wait,
  waitForElement,
} from '@testing-library/react';
import { strictEqual } from 'assert';
import { TERM } from 'common/constants';
import { dayEnumToString } from 'common/constants/day';
import { TermKey } from 'common/constants/term';
import React from 'react';
import { SinonStub, stub } from 'sinon';
import { render } from 'test-utils';
import { cs50CourseInstance } from 'testData';
import MeetingModal from '../MeetingModal';

describe('Meeting Modal', function () {
  describe('rendering', function () {
    let getByText: BoundFunction<GetByText>;
    let queryByText: BoundFunction<QueryByText>;
    let onCloseStub: SinonStub;
    const dispatchMessage: SinonStub = stub();
    const meetingTerm = TERM.FALL;
    const semKey = meetingTerm.toLowerCase() as TermKey;
    const testCourseInstance = cs50CourseInstance;
    beforeEach(function () {
      onCloseStub = stub();
      ({ getByText, queryByText } = render(
        <MeetingModal
          isVisible
          currentCourseInstance={{
            course: testCourseInstance,
            term: meetingTerm,
          }}
          onClose={onCloseStub}
        />,
        dispatchMessage
      ));
    });
    describe('On Open Behavior', function () {
      it('populates the heading with the correct course instance information', function () {
        return waitForElement(
          () => getByText(`Meetings for ${cs50CourseInstance.catalogNumber} - ${meetingTerm} ${cs50CourseInstance[semKey].calendarYear}`)
        );
      });
      describe('Faculty Notes', function () {
        context('when the faculty member has associated notes', function () {
          it('displays the faculty notes associated with the course instance', async function () {
            const facultyWithNotes = (testCourseInstance.fall.instructors
              .filter((instructor) => (instructor.notes !== '' && instructor.notes !== null)));
            const expectedNotes = facultyWithNotes
              .map((faculty) => faculty.notes);
            return Promise.all(expectedNotes.map((note) => waitForElement(
              () => getByText(note)
            )));
          });
        });
        context('when the faculty member does not have associated notes', function () {
          context('when faculty notes is an empty string', function () {
            it('displays the text "No Notes"', function () {
              const facultyWithoutNotes = (testCourseInstance.fall.instructors
                .filter((instructor) => (instructor.notes === '')));
              const modalNotes = getByText('Faculty Notes', { exact: false }).nextElementSibling;
              const noNotesLength = (modalNotes as HTMLElement).textContent.match(/s*No Notes\s*$/g).length;
              strictEqual(facultyWithoutNotes.length, noNotesLength);
            });
          });
          context('when faculty notes is null', function () {
            it('displays the text "No Notes"', function () {
              const facultyWithNullNotes = (testCourseInstance.fall.instructors
                .filter((instructor) => (instructor.notes === null)));
              const modalNotes = getByText('Faculty Notes', { exact: false }).nextElementSibling;
              const noNotesLength = (modalNotes as HTMLElement).textContent.match(/s*No Notes\s*$/g).length;
              strictEqual(facultyWithNullNotes.length, noNotesLength);
            });
          });
        });
      });
      describe('Meeting Times', function () {
        it('displays each of the existing meetings', function () {
          const expectedMeetings = testCourseInstance.fall.meetings
            .map((meeting) => `${dayEnumToString(meeting.day)}, ${meeting.startTime} to ${meeting.endTime} in ${meeting.room.name}`);
          return Promise.all(expectedMeetings.map((meeting) => waitForElement(
            () => getByText(meeting)
          )));
        });
      });
    });
    describe('On Close Behavior', function () {
      it('calls the onClose handler once', async function () {
        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);
        await wait(() => !queryByText(/Meetings for/));
        await wait(() => strictEqual(onCloseStub.callCount, 1));
      });
    });
  });
});
