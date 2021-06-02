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
import DAY, { dayEnumToString } from 'common/constants/day';
import { TermKey } from 'common/constants/term';
import { calculateStartEndTimes, convert12To24HourTime, convertTo12HourDisplayTime } from 'common/utils/timeHelperFunctions';
import React from 'react';
import { SinonStub, stub } from 'sinon';
import { render } from 'test-utils';
import { cs50CourseInstance } from 'testData';
import MeetingModal from '../MeetingModal';

describe('Meeting Modal', function () {
  describe('rendering', function () {
    let getByText: BoundFunction<GetByText>;
    let queryByText: BoundFunction<QueryByText>;
    let getByLabelText: BoundFunction<GetByText>;
    let onCloseStub: SinonStub;
    const dispatchMessage: SinonStub = stub();
    const meetingTerm = TERM.FALL;
    const semKey = meetingTerm.toLowerCase() as TermKey;
    const testCourseInstance = cs50CourseInstance;
    beforeEach(function () {
      onCloseStub = stub();
      ({ getByText, queryByText, getByLabelText } = render(
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
        describe('On Initial Rendering', function () {
          it('displays each of the existing meetings', function () {
            const expectedMeetings = testCourseInstance.fall.meetings
              .map((meeting) => `${dayEnumToString(meeting.day)}, ${meeting.startTime} to ${meeting.endTime} in ${meeting.room.name}`);
            return Promise.all(expectedMeetings.map((meeting) => waitForElement(
              () => getByText(meeting)
            )));
          });
        });
        describe('On Edit Behavior', function () {
          const testMeetingDay = DAY.FRI;
          const cs50InitialMeeting = testCourseInstance[semKey].meetings
            .filter((meeting) => meeting.day === testMeetingDay)[0];
          const cs50TuesdayMeetingId = testCourseInstance[semKey].meetings
            .filter((meeting) => meeting.day === DAY.TUE)[0].id;
          beforeEach(async function () {
            const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
            fireEvent.click(editCS50InitialMeetingButton);
          });
          context('when an edit button is clicked', function () {
            it('displays the correct initial meeting day', function () {
              const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
              strictEqual(dayDropdown.value, testMeetingDay);
            });
            it('displays the correct initial start time', function () {
              const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
              strictEqual(
                convertTo12HourDisplayTime(startTimeDropdown.value),
                cs50InitialMeeting.startTime
              );
            });
            it('displays the correct initial end time', function () {
              const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
              strictEqual(
                convertTo12HourDisplayTime(endTimeDropdown.value),
                cs50InitialMeeting.endTime
              );
            });
            context('when a timeslot is selected', function () {
              const timeslot = '10:00 AM-11:00 AM';
              const expectedTimes = calculateStartEndTimes(timeslot);
              beforeEach(async function () {
                const timepicker = await waitForElement(() => document.getElementById('timeslots'));
                fireEvent.change(timepicker, { target: { value: timeslot } });
              });
              it('populates the start time text input field with the expected time', function () {
                const startTimeInput = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                const expectedStartTime = convert12To24HourTime(
                  expectedTimes.start
                );
                strictEqual(startTimeInput.value, expectedStartTime);
              });
              it('populates the end time text input field with the expected time', function () {
                const endTimeInput = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                const expectedEndTime = convert12To24HourTime(
                  expectedTimes.end
                );
                strictEqual(endTimeInput.value, expectedEndTime);
              });
            });
          });
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
