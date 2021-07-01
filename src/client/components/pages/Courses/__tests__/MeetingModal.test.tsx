import {
  AllByRole,
  AllByText,
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
import {
  convert12To24HourTime,
  convertTo12HourDisplayTime,
} from 'common/utils/timeHelperFunctions';
import React from 'react';
import { SinonStub, stub } from 'sinon';
import { render } from 'test-utils';
import { cs50CourseInstance } from 'testData';
import MeetingModal from '../MeetingModal';

describe('Meeting Modal', function () {
  describe('rendering', function () {
    let getByText: BoundFunction<GetByText>;
    let getAllByText: BoundFunction<AllByText>;
    let queryByText: BoundFunction<QueryByText>;
    let getByLabelText: BoundFunction<GetByText>;
    let findByLabelText: BoundFunction<FindByText>;
    let queryAllByRole: BoundFunction<AllByRole>;
    let onCloseStub: SinonStub;
    let onSaveStub: SinonStub;
    const meetingTerm = TERM.FALL;
    const semKey = meetingTerm.toLowerCase() as TermKey;
    const testCourseInstance = cs50CourseInstance;
    beforeEach(function () {
      onCloseStub = stub();
      onSaveStub = stub();
      ({
        getByText,
        getAllByText,
        queryByText,
        getByLabelText,
        findByLabelText,
        queryAllByRole,
      } = render(
        <MeetingModal
          isVisible
          currentCourse={testCourseInstance}
          currentSemester={{
            calendarYear: parseInt(testCourseInstance[semKey].calendarYear, 10),
            term: meetingTerm,
          }}
          onClose={onCloseStub}
          onSave={onSaveStub}
        />
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
          it('displays each of the existing meeting times', function () {
            const expectedMeetingTimes = testCourseInstance.fall.meetings
              .map((meeting) => `${dayEnumToString(meeting.day)}, ${meeting.startTime} to ${meeting.endTime}`);
            return Promise.all(
              expectedMeetingTimes.map((meeting) => waitForElement(
                () => getByText(meeting, { exact: false })
              ))
            );
          });
          it('displays each of the existing meeting locations', function () {
            const expectedMeetingLocation = testCourseInstance.fall.meetings
              .map((meeting) => `${meeting.room !== null ? `in ${meeting.room.name}` : ''}`);
            return Promise.all(
              expectedMeetingLocation.map((meeting) => waitForElement(
                () => getAllByText(meeting, { exact: false })
              ))
            );
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
              const times = timeslot.split('-');
              const expectedStartTime = convert12To24HourTime(times[0]);
              const expectedEndTime = convert12To24HourTime(times[1]);
              beforeEach(async function () {
                const timepicker = await waitForElement(() => findByLabelText('Timeslot Button'));
                fireEvent.click(timepicker);
                fireEvent.click(getByText(timeslot));
              });
              it('populates the start time text input field with the expected time', function () {
                const startTimeInput = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                strictEqual(startTimeInput.value, expectedStartTime);
              });
              it('populates the end time text input field with the expected time', function () {
                const endTimeInput = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                strictEqual(endTimeInput.value, expectedEndTime);
              });
              context('after navigating to a different meeting', function () {
                beforeEach(async function () {
                  const editCS50TuesdayMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50TuesdayMeetingId));
                  fireEvent.click(editCS50TuesdayMeetingButton);
                  // Navigating back to the original meeting
                  const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                  fireEvent.click(editCS50InitialMeetingButton);
                });
                it('preserves the updated start time', function () {
                  const startTimeInput = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                  strictEqual(startTimeInput.value, expectedStartTime);
                });
                it('preserves the updated end time', function () {
                  const endTimeInput = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                  strictEqual(endTimeInput.value, expectedEndTime);
                });
              });
              context('after clicking the "Save" button', function () {
                it('renders no validation error messages', function () {
                  const saveButton = getByText('Save');
                  fireEvent.click(saveButton);
                  // The row remains expanded at this point, and the text
                  // content of the error message of the row should be empty.
                  strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                });
              });
              context('after clicking the "Show Rooms" button', function () {
                it('renders no validation error messages', function () {
                  const showRoomsButton = getByText('Show Rooms');
                  fireEvent.click(showRoomsButton);
                  // The row remains expanded at this point, and the text
                  // content of the error message of the row should be empty.
                  strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                });
              });
              context('after clicking the "Close" button', function () {
                it('renders no validation error messages', function () {
                  const closeButton = getByText('Close');
                  // Collapses the meeting row
                  fireEvent.click(closeButton);
                  strictEqual(queryAllByRole('alert').length, 0);
                });
                it('preserves the updated start time', async function () {
                  const closeButton = getByText('Close');
                  fireEvent.click(closeButton);
                  // Reopen the original meeting to check value
                  const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                  fireEvent.click(editCS50InitialMeetingButton);
                  const startTimeInput = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                  strictEqual(startTimeInput.value, expectedStartTime);
                });
                it('preserves the updated end time', async function () {
                  const closeButton = getByText('Close');
                  fireEvent.click(closeButton);
                  // Reopen the original meeting to check value
                  const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                  fireEvent.click(editCS50InitialMeetingButton);
                  const endTimeInput = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                  strictEqual(endTimeInput.value, expectedEndTime);
                });
              });
              context('after clicking the "Add New Time" button', function () {
                it('renders no validation error messages', function () {
                  const addNewTimeButton = getByText('Add New Time');
                  fireEvent.click(addNewTimeButton);
                  // A new meeting row expands, which includes an empty validation error field
                  strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                });
                context('when returning to the original meeting', function () {
                  beforeEach(async function () {
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    // Fill out the newly added meeting row before checking the original meeting, since the newly added row cannot be blank.
                    const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(dayDropdown,
                      { target: { value: DAY.THU } });
                    const timepicker = await waitForElement(() => findByLabelText('Timeslot Button'));
                    fireEvent.click(timepicker);
                    fireEvent.click(getByText(timeslot));
                  });
                  it('preserves the originally updated start time', async function () {
                    // Reopen the original meeting to check its value
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    const startTimeInput = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                    strictEqual(startTimeInput.value, expectedStartTime);
                  });
                  it('preserves the originally updated end time', async function () {
                    // Reopen the original meeting to check value
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    const endTimeInput = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                    strictEqual(endTimeInput.value, expectedEndTime);
                  });
                });
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
                context('after clicking the "Save" button', function () {
                  it('renders no validation error messages', function () {
                    const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(dayDropdown,
                      { target: { value: updatedDay } });
                    const saveButton = getByText('Save');
                    fireEvent.click(saveButton);
                    // The row remains expanded at this point, and the text
                    // content of the error message of the row should be empty.
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                });
                context('after clicking the "Show Rooms" button', function () {
                  it('renders no validation error messages', function () {
                    const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(dayDropdown,
                      { target: { value: updatedDay } });
                    const showRoomsButton = getByText('Show Rooms');
                    fireEvent.click(showRoomsButton);
                    // The row remains expanded at this point, and the text
                    // content of the error message of the row should be empty.
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                });
                context('after clicking the "Close" button', function () {
                  it('renders no validation error messages', function () {
                    const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(dayDropdown,
                      { target: { value: updatedDay } });
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    strictEqual(queryAllByRole('alert').length, 0);
                  });
                  it('preserves the updated day value', async function () {
                    const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(dayDropdown,
                      { target: { value: updatedDay } });
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    strictEqual(dayDropdown.value, updatedDay);
                  });
                });
                context('after clicking the "Add New Time" button', function () {
                  it('renders no validation error messages', function () {
                    const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(dayDropdown,
                      { target: { value: updatedDay } });
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    // A new meeting row expands, which includes an empty validation error field
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                  it('preserves the updated day value', async function () {
                    const originalDayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(originalDayDropdown,
                      { target: { value: updatedDay } });
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    // Fill out the newly added meeting row before checking the original meeting, since the newly added row cannot be blank.
                    const newDayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(newDayDropdown,
                      { target: { value: DAY.THU } });
                    const timepicker = await waitForElement(() => findByLabelText('Timeslot Button'));
                    fireEvent.click(timepicker);
                    fireEvent.click(getByText('10:00 AM-11:00 AM'));
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    strictEqual(originalDayDropdown.value, updatedDay);
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
                context('after clicking on the "Save" button', function () {
                  it('displays a validation error message', async function () {
                    const saveButton = getByText('Save');
                    fireEvent.click(saveButton);
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
                context('after clicking on the "Close" button', function () {
                  it('displays a validation error message', async function () {
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking the "Add New Time" button', function () {
                  it('displays a validation error message', async function () {
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
              });
            });
            describe('Start Time Input', function () {
              context('when changed to a valid value', function () {
                const updatedStartTime = '01:00';
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
                context('after clicking the "Save" button', function () {
                  it('renders no validation error messages', function () {
                    const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(startTimeDropdown,
                      { target: { value: updatedStartTime } });
                    const saveButton = getByText('Save');
                    fireEvent.click(saveButton);
                    // The row remains expanded at this point, and the text
                    // content of the error message of the row should be empty.
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                });
                context('after clicking the "Show Rooms" button', function () {
                  it('renders no validation error messages', function () {
                    const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(startTimeDropdown,
                      { target: { value: updatedStartTime } });
                    const showRoomsButton = getByText('Show Rooms');
                    fireEvent.click(showRoomsButton);
                    // The row remains expanded at this point, and the text
                    // content of the error message of the row should be empty.
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                });
                context('after clicking the "Close" button', function () {
                  it('renders no validation error messages', function () {
                    const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(startTimeDropdown,
                      { target: { value: updatedStartTime } });
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    strictEqual(queryAllByRole('alert').length, 0);
                  });
                  it('preserves the updated start time value', async function () {
                    const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(startTimeDropdown,
                      { target: { value: updatedStartTime } });
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    strictEqual(
                      startTimeDropdown.value,
                      convert12To24HourTime(updatedStartTime)
                    );
                  });
                });
                context('after clicking the "Add New Time" button', function () {
                  it('renders no validation error messages', function () {
                    const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(startTimeDropdown,
                      { target: { value: updatedStartTime } });
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    // A new meeting row expands, which includes an empty validation error field
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                  it('preserves the updated start time', async function () {
                    const startTimeDropdown = getByLabelText('Meeting Start Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(startTimeDropdown,
                      { target: { value: updatedStartTime } });
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    // Fill out the newly added meeting row before checking the original meeting, since the newly added row cannot be blank.
                    const newDayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(newDayDropdown,
                      { target: { value: DAY.THU } });
                    const timepicker = await waitForElement(() => findByLabelText('Timeslot Button'));
                    fireEvent.click(timepicker);
                    fireEvent.click(getByText('10:00 AM-11:00 AM'));
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
                context('after clicking on the "Save" button', function () {
                  it('displays a validation error message', function () {
                    const saveButton = getByText('Save');
                    fireEvent.click(saveButton);
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
                context('after clicking on the "Close" button', function () {
                  it('displays a validation error message', async function () {
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Add New Time" button', function () {
                  it('displays a validation error message', async function () {
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
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
                context('after clicking on the "Save" button', function () {
                  it('displays a validation error message', function () {
                    const saveButton = getByText('Save');
                    fireEvent.click(saveButton);
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
                context('after clicking on the "Close" button', function () {
                  it('displays a validation error message', async function () {
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Add New Time" button', function () {
                  it('displays a validation error message', async function () {
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
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
                context('after clicking the "Save" button', function () {
                  it('renders no validation error messages', function () {
                    const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(endTimeDropdown,
                      { target: { value: updatedEndTime } });
                    const saveButton = getByText('Save');
                    fireEvent.click(saveButton);
                    // The row remains expanded at this point, and the text
                    // content of the error message of the row should be empty.
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                });
                context('after clicking the "Show Rooms" button', function () {
                  it('renders no validation error messages', function () {
                    const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(endTimeDropdown,
                      { target: { value: updatedEndTime } });
                    const showRoomsButton = getByText('Show Rooms');
                    fireEvent.click(showRoomsButton);
                    // The row remains expanded at this point, and the text
                    // content of the error message of the row should be empty.
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                });
                context('after clicking the "Close" button', function () {
                  it('renders no validation error messages', function () {
                    const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(endTimeDropdown,
                      { target: { value: updatedEndTime } });
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    strictEqual(queryAllByRole('alert').length, 0);
                  });
                  it('preserves the updated end time value', async function () {
                    const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(endTimeDropdown,
                      { target: { value: updatedEndTime } });
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    const editCS50InitialMeetingButton = await waitForElement(() => document.getElementById('editMeetingButton' + cs50InitialMeeting.id));
                    fireEvent.click(editCS50InitialMeetingButton);
                    strictEqual(
                      endTimeDropdown.value,
                      convert12To24HourTime(updatedEndTime)
                    );
                  });
                });
                context('after clicking the "Add New Time" button', function () {
                  it('renders no validation error messages', function () {
                    const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(endTimeDropdown,
                      { target: { value: updatedEndTime } });
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    // A new meeting row expands, which includes an empty validation error field
                    strictEqual(queryAllByRole('alert')[0].innerText, undefined);
                  });
                  it('preserves the updated end time', async function () {
                    const endTimeDropdown = getByLabelText('Meeting End Time', { exact: false }) as HTMLInputElement;
                    fireEvent.change(endTimeDropdown,
                      { target: { value: updatedEndTime } });
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    // Fill out the newly added meeting row before checking the original meeting, since the newly added row cannot be blank.
                    const newDayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                    fireEvent.change(newDayDropdown,
                      { target: { value: DAY.THU } });
                    const timepicker = await waitForElement(() => findByLabelText('Timeslot Button'));
                    fireEvent.click(timepicker);
                    fireEvent.click(getByText('10:00 AM-11:00 AM'));
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
                context('after clicking on the "Save" button', function () {
                  it('displays a validation error message', function () {
                    const saveButton = getByText('Save');
                    fireEvent.click(saveButton);
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
                context('after clicking on the "Close" button', function () {
                  it('displays a validation error message', async function () {
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Add New Time" button', function () {
                  it('displays a validation error message', async function () {
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
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
                context('after clicking on the "Save" button', function () {
                  it('displays a validation error message', function () {
                    const saveButton = getByText('Save');
                    fireEvent.click(saveButton);
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
                context('after clicking on the "Close" button', function () {
                  it('displays a validation error message', async function () {
                    const closeButton = getByText('Close');
                    fireEvent.click(closeButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
                context('after clicking on the "Add New Time" button', function () {
                  it('displays a validation error message', async function () {
                    const addNewTimeButton = getByText('Add New Time');
                    fireEvent.click(addNewTimeButton);
                    return waitForElement(
                      () => getByText(errorMessage, { exact: false })
                    );
                  });
                });
              });
            });
          });
        });
        describe('On Add Behavior', function () {
          context('when the "Add New Time" button is clicked', function () {
            const errorMessage = 'Please provide a day and start/end times before proceeding.';
            beforeEach(function () {
              const addNewTimeButton = getByText('Add New Time');
              fireEvent.click(addNewTimeButton);
            });
            it('renders no initial validation error messages', function () {
              // A new meeting row expands, which includes an empty validation error field
              strictEqual(queryAllByRole('alert')[0].innerText, undefined);
            });
            context('when the "Add New Time" button is clicked again', function () {
              context('when the form fields of the initial row have not been filled out', function () {
                it('displays a validation error message', function () {
                  // Clicking "Add New Time" a second time
                  const addNewTimeButton = getByText('Add New Time');
                  fireEvent.click(addNewTimeButton);
                  return waitForElement(
                    () => getByText(errorMessage, { exact: false })
                  );
                });
              });
              context('when the form fields of the initial row have been filled out', function () {
                it('does not display a validation error message', async function () {
                  const dayDropdown = getByLabelText('Meeting Day', { exact: false }) as HTMLSelectElement;
                  fireEvent.change(dayDropdown,
                    { target: { value: DAY.THU } });
                  const timepicker = await waitForElement(() => findByLabelText('Timeslot Button'));
                  fireEvent.click(timepicker);
                  fireEvent.click(getByText('11:00 AM-12:00 PM'));
                  // Clicking "Add New Time" a second time
                  const addNewTimeButton = getByText('Add New Time');
                  fireEvent.click(addNewTimeButton);
                  strictEqual(queryAllByRole('alert')[0].innerText, undefined);
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
    describe('On Save Behavior', function () {
      it('calls the onSave handler once', async function () {
        const saveButton = getByText('Save');
        fireEvent.click(saveButton);
        await wait(() => strictEqual(onSaveStub.callCount, 1));
      });
    });
  });
});
