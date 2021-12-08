import {
  waitForElement,
} from '@testing-library/react';
import React, {
  FunctionComponent, ReactElement,
} from 'react';
import { spy, SinonSpy } from 'sinon';
import {
  cs50CourseInstance, ac209aCourseInstance, ac209aCourseInstanceWithoutRooms,
} from 'testData';
import { strictEqual, deepStrictEqual, notStrictEqual } from 'assert';
import {
  TERM, COURSE_TABLE_COLUMN, isSEASEnumToString, IS_SEAS,
} from 'common/constants';
import { render } from 'test-utils';
import { dayEnumToString } from 'common/constants/day';
import { offeredEnumToString } from 'common/constants/offered';
import {
  retrieveValue,
  tableFields,
  formatInstructors,
  formatMeetings,
  formatFacultyNotes,
  CourseInstanceListColumn,
} from '../tableFields';
import { PGTime } from '../../../../../common/utils/PGTime';
import CourseInstanceResponseDTO from '../../../../../common/dto/courses/CourseInstanceResponse';

describe('tableFields', function () {
  let updateSpy: SinonSpy;
  beforeEach(function () {
    updateSpy = spy();
  });
  describe('helper functions', function () {
    describe('retrieveValue', function () {
      const TestComponent = (
        {
          getValue,
          course,
        }: {
          getValue: CourseInstanceListColumn['getValue'],
          course: CourseInstanceResponseDTO}
      ) => (
        <p>
          {getValue(course)}
        </p>
      );
      it('should return a function to get course-level fields', function () {
        const { getByText } = render(
          <TestComponent
            getValue={retrieveValue('catalogNumber')}
            course={cs50CourseInstance}
          />
        );
        return getByText(
          cs50CourseInstance.catalogNumber
        );
      });
      it('Should return a function to get a semester-level field', function () {
        const { getByText } = render(
          <TestComponent
            getValue={retrieveValue('actualEnrollment', TERM.FALL)}
            course={cs50CourseInstance}
          />
        );
        return getByText(
          cs50CourseInstance.fall.actualEnrollment.toString()
        );
      });
      it('should return a function that converts true booleans to "Yes"', function () {
        const { getByText } = render(
          <TestComponent
            getValue={retrieveValue('isUndergraduate')}
            course={cs50CourseInstance}
          />
        );
        return getByText('Yes');
      });
      it('should return a function that converts false booleans to "No"', function () {
        const { getByText } = render(
          <TestComponent
            getValue={retrieveValue('isUndergraduate')}
            course={{ ...cs50CourseInstance, isUndergraduate: false }}
          />
        );
        return getByText('No');
      });
      it('Should return a function that converts OFFERED values to strings', function () {
        const { getByText } = render(
          <TestComponent
            getValue={retrieveValue('offered', TERM.FALL)}
            course={cs50CourseInstance}
          />
        );
        return getByText(
          offeredEnumToString(cs50CourseInstance.fall.offered)
        );
      });
      it('Should return a function that converts IS_SEAS.Y to "Yes"', function () {
        const { getByText } = render(
          <TestComponent
            getValue={retrieveValue('isSEAS')}
            course={{
              ...cs50CourseInstance,
              isSEAS: IS_SEAS.Y,
            }}
          />
        );
        return getByText(
          isSEASEnumToString(IS_SEAS.Y)
        );
      });
      it('Should return a function that converts IS_SEAS.N to "No"', function () {
        const { getByText } = render(
          <TestComponent
            getValue={retrieveValue('isSEAS')}
            course={{
              ...cs50CourseInstance,
              isSEAS: IS_SEAS.N,
            }}
          />
        );
        return getByText(
          isSEASEnumToString(IS_SEAS.N)
        );
      });
      it('Should return a function that converts IS_SEAS.EPS to "EPS"', function () {
        const { getByText } = render(
          <TestComponent
            getValue={retrieveValue('isSEAS')}
            course={{
              ...cs50CourseInstance,
              isSEAS: IS_SEAS.EPS,
            }}
          />
        );
        return getByText(
          isSEASEnumToString(IS_SEAS.EPS)
        );
      });
    });
    describe('formatInstructors', function () {
      let TestComponent: FunctionComponent<unknown>;
      context('When course has data', function () {
        beforeEach(function () {
          const fallInstructors = formatInstructors(TERM.FALL);
          TestComponent = () => (
            <div>
              {fallInstructors(ac209aCourseInstance, { updateHandler: spy() })}
            </div>
          );
        });
        it('Should return a component that renders instructors as a list', function () {
          const { getAllByRole } = render(<TestComponent />);
          const entries = getAllByRole('listitem')
            .map(({ textContent }): string => textContent);
          const instructorList = ac209aCourseInstance.fall.instructors
            .map(({ displayName }): string => displayName);
          deepStrictEqual(entries, instructorList);
        });
        it('Should render an edit button', function () {
          const { queryByLabelText } = render(<TestComponent />);
          const editButtonRegex = new RegExp(
            `edit instructors.*?${
              ac209aCourseInstance.catalogNumber
            }.*?${
              TERM.FALL
            }.*?${
              ac209aCourseInstance.fall.calendarYear
            }`,
            'i'
          );
          const editButton = queryByLabelText(editButtonRegex);
          notStrictEqual(
            editButton,
            null
          );
        });
      });
      context('When semester does not have any instructors', function () {
        beforeEach(function () {
          const springInstructors = formatInstructors(TERM.SPRING);
          TestComponent = () => (
            <div>
              {springInstructors(
                ac209aCourseInstance,
                {
                  updateHandler: spy(),
                }
              )}
            </div>
          );
        });
        it('Should render an edit button', function () {
          const { queryByLabelText } = render(<TestComponent />);
          const editButtonRegex = new RegExp(
            `edit instructors.*?${
              ac209aCourseInstance.catalogNumber
            }.*?${
              TERM.SPRING
            }.*?${
              ac209aCourseInstance.spring.calendarYear
            }`,
            'i'
          );
          const editButton = queryByLabelText(editButtonRegex);
          notStrictEqual(
            editButton,
            null
          );
        });
      });
    });
    describe('formatMeetings', function () {
      context('When semester has data', function () {
        context('With times and rooms', function () {
          it('Should return a component that renders days, times and rooms as a list', function () {
            const fallMeetings = formatMeetings(TERM.FALL);
            const TestComponent: FunctionComponent = (): ReactElement => (
              <div>
                {fallMeetings(
                  ac209aCourseInstance,
                  { updateHandler: updateSpy }
                )}
              </div>
            );
            const { getAllByRole } = render(
              <TestComponent />
            );
            const entries = getAllByRole('listitem')
              .map(({ textContent }): string => textContent);
            const timesList = ac209aCourseInstance.fall.meetings
              .map(({
                day, startTime, endTime, room,
              }): string => (
                `${
                  dayEnumToString(day)
                }${
                  PGTime.toDisplay(startTime)
                } - ${
                  PGTime.toDisplay(endTime)
                }${
                  room.name
                }${
                  room.campus
                }`));
            deepStrictEqual(entries, timesList);
          });
        });
        context('With times but not rooms', function () {
          it('Should return a component that renders just days and times as a list', function () {
            const fallMeetings = formatMeetings(TERM.FALL);
            const TestComponent: FunctionComponent = (): ReactElement => (
              <div>
                {fallMeetings(
                  ac209aCourseInstanceWithoutRooms,
                  { updateHandler: updateSpy }
                )}
              </div>
            );
            const { getAllByRole } = render(
              <TestComponent />
            );
            const entries = getAllByRole('listitem')
              .map(({ textContent }): string => textContent);
            const timesList = ac209aCourseInstance.fall.meetings
              .map(({ day, startTime, endTime }): string => (
                `${
                  dayEnumToString(day)
                }${
                  PGTime.toDisplay(startTime)
                } - ${
                  PGTime.toDisplay(endTime)
                }`));
            deepStrictEqual(entries, timesList);
          });
        });
      });
      context('When semester does not have data', function () {
        it('Should return an empty list', function () {
          const springTimes = formatMeetings(TERM.SPRING);
          const TestComponent: FunctionComponent = (): ReactElement => (
            <div>
              {springTimes(
                ac209aCourseInstance,
                { updateHandler: updateSpy }
              )}
            </div>
          );
          const { queryAllByRole } = render(
            <TestComponent />
          );
          strictEqual(queryAllByRole('listitem').length, 0);
        });
      });
    });
    describe('formatFacultyNotes', function () {
      context('when the faculty member has associated notes', function () {
        it('displays the faculty notes associated with the course instance', async function () {
          const TestComponent: FunctionComponent = (): ReactElement => (
            <div>
              {formatFacultyNotes(TERM.FALL, ac209aCourseInstance)}
            </div>
          );
          const { getByText } = render(
            <TestComponent />
          );
          const facultyWithNotes = (ac209aCourseInstance.fall.instructors
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
            const TestComponent: FunctionComponent = (): ReactElement => (
              <div>
                {formatFacultyNotes(TERM.FALL, cs50CourseInstance)}
              </div>
            );
            const { getByText } = render(
              <TestComponent />
            );
            const facultyWithoutNotes = (cs50CourseInstance.fall.instructors
              .filter((instructor) => (instructor.notes === '')));
            const modalNotes = getByText('Faculty Notes', { exact: false }).nextElementSibling;
            const noNotesLength = (modalNotes as HTMLElement).textContent.match(/s*No Notes\s*$/g).length;
            strictEqual(facultyWithoutNotes.length, noNotesLength);
          });
        });
        context('when faculty notes is null', function () {
          it('displays the text "No Notes"', function () {
            const TestComponent: FunctionComponent = (): ReactElement => (
              <div>
                {formatFacultyNotes(TERM.FALL, cs50CourseInstance)}
              </div>
            );
            const { getByText } = render(
              <TestComponent />
            );
            const facultyWithNullNotes = (cs50CourseInstance.fall.instructors
              .filter((instructor) => (instructor.notes === null)));
            const modalNotes = getByText('Faculty Notes', { exact: false }).nextElementSibling;
            const noNotesLength = (modalNotes as HTMLElement).textContent.match(/s*No Notes\s*$/g).length;
            strictEqual(facultyWithNullNotes.length, noNotesLength);
          });
        });
      });
    });
    describe('Notes field', function () {
      const TestComponent = (
        {
          getValue,
          course,
        }: {
          getValue: CourseInstanceListColumn['getValue'],
          course: CourseInstanceResponseDTO}
      ) => (
        <p>
          {getValue(course)}
        </p>
      );
      context('Course with Notes', function () {
        it('renders a button to view/edit notes', function () {
          const notesField = tableFields.find(({ viewColumn }): boolean => (
            viewColumn === COURSE_TABLE_COLUMN.NOTES));
          const { queryByLabelText } = render(
            <TestComponent
              getValue={notesField.getValue}
              course={ac209aCourseInstance}
            />
          );
          const icon = queryByLabelText('View/Edit Notes');
          strictEqual(icon !== null, true);
        });
      });
      context('Course without notes', function () {
        it('renders a button to add notes', function () {
          const notesField = tableFields.find(({ viewColumn }): boolean => (
            viewColumn === COURSE_TABLE_COLUMN.NOTES));
          const { queryByLabelText } = render(
            <TestComponent
              getValue={notesField.getValue}
              course={cs50CourseInstance}
            />
          );
          const icon = queryByLabelText('Add Notes');
          strictEqual(icon !== null, true);
        });
      });
    });
  });
});
