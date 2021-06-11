import {
  BoundFunction,
  FindByText,
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
    let findByLabelText: BoundFunction<FindByText>;
    let onCloseStub: SinonStub;
    const dispatchMessage: SinonStub = stub();
    const meetingTerm = TERM.FALL;
    const semKey = meetingTerm.toLowerCase() as TermKey;
    const testCourseInstance = cs50CourseInstance;
    beforeEach(function () {
      onCloseStub = stub();
      ({
        getByText,
        queryByText,
        getByLabelText,
        findByLabelText,
      } = render(
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
              const timeslot = '12:00 PM-1:00 PM';
              const expectedTimes = calculateStartEndTimes(timeslot);
              beforeEach(async function () {
                const timepicker = await waitForElement(() => findByLabelText('Timeslot Button'));
                fireEvent.click(timepicker);
                fireEvent.click(getByText(timeslot));
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
            describe('Day Dropdown', function () {
              context('when changed to a valid value', function () {
                const updatedDay = DAY.MON;
                context('after navigating to a different meeting', function () {
                  it('preserves the updated day value', async function () {
                    const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(dayDropdown,
                      { target: { value: updatedDay } });
                    const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                    fireEvent.click(editCS50TuesdayMeetingButton);
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    strictEqual(dayDropdown.value, updatedDay);
                  });
                });
              });
              context('when changed to an empty value', function () {
                const errorMessage = 'Please provide a day and start/end times before proceeding.';
                beforeEach(function () {
                  const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                  fireEvent.change(dayDropdown, { target: { value: '' } });
                });
                context('after clicking the edit button of a different meeting', function () {
                  it('displays a validation error message', async function () {
                    const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                    fireEvent.click(editCS50TuesdayMeetingButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Show Rooms" button', function () {
                  it('displays a validation error message', async function () {
                    const showRoomsButton = getByText('Show Rooms');
                    fireEvent.click(showRoomsButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
              });
            });
            describe('Start Time Input', function () {
              context('when changed to a valid value', function () {
                const updatedStartTime = '12:00';
                context('after navigating to a different meeting', function () {
                  it('preserves the updated start time value', async function () {
                    const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(startTimeDropdown,
                      { target: { value: updatedStartTime } });
                    const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                    fireEvent.click(editCS50TuesdayMeetingButton);
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    strictEqual(
                      startTimeDropdown.value,
                      convert12To24HourTime(updatedStartTime)
                    );
                  });
                });
              });
              context('when changed to an empty value', function () {
                const errorMessage = 'Please provide a day and start/end times before proceeding.';
                beforeEach(function () {
                  const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                  fireEvent.change(startTimeDropdown, { target: { value: '' } });
                });
                context('after clicking the edit button of a different meeting', function () {
                  it('displays a validation error message', async function () {
                    const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                    fireEvent.click(editCS50TuesdayMeetingButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Show Rooms" button', function () {
                  it('displays a validation error message', function () {
                    const showRoomsButton = getByText('Show Rooms');
                    fireEvent.click(showRoomsButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
              });
              context('when changed to a value later than end time', function () {
                const errorMessage = 'End time must be later than start time.';
                const updatedStartTime = convert12To24HourTime('11:59 PM');
                beforeEach(function () {
                  const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                  fireEvent.change(startTimeDropdown,
                    { target: { value: updatedStartTime } });
                });
                context('after clicking the edit button of a different meeting', function () {
                  it('displays a validation error message', async function () {
                    const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                    fireEvent.click(editCS50TuesdayMeetingButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Show Rooms" button', function () {
                  it('displays a validation error message', function () {
                    const showRoomsButton = getByText('Show Rooms');
                    fireEvent.click(showRoomsButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
              });
            });
            describe('End Time Input', function () {
              context('when changed to a valid value', function () {
                const updatedEndTime = '14:00';
                context('after navigating to a different meeting', function () {
                  it('preserves the updated end time value', async function () {
                    const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(endTimeDropdown,
                      { target: { value: updatedEndTime } });
                    const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                    fireEvent.click(editCS50TuesdayMeetingButton);
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    strictEqual(
                      endTimeDropdown.value,
                      convert12To24HourTime(updatedEndTime)
                    );
                  });
                });
              });
              context('when changed to an empty value', function () {
                const errorMessage = 'Please provide a day and start/end times before proceeding.';
                beforeEach(function () {
                  const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                  fireEvent.change(endTimeDropdown, { target: { value: '' } });
                });
                context('after clicking the edit button of a different meeting', function () {
                  it('displays a validation error message', async function () {
                    const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                    fireEvent.click(editCS50TuesdayMeetingButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Show Rooms" button', function () {
                  it('displays a validation error message', function () {
                    const showRoomsButton = getByText('Show Rooms');
                    fireEvent.click(showRoomsButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
              });
              context('when changed to a value earlier than start time', function () {
                const errorMessage = 'End time must be later than start time.';
                const updatedEndTime = convert12To24HourTime('12:01 AM');
                beforeEach(function () {
                  const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                  fireEvent.change(endTimeDropdown,
                    { target: { value: updatedEndTime } });
                });
                context('after clicking the edit button of a different meeting', function () {
                  it('displays a validation error message', async function () {
                    const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                    fireEvent.click(editCS50TuesdayMeetingButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Show Rooms" button', function () {
                  it('displays a validation error message', function () {
                    const showRoomsButton = getByText('Show Rooms');
                    fireEvent.click(showRoomsButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
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
