import {
  waitForElement,
} from '@testing-library/react';
import React, { FunctionComponent, ReactElement } from 'react';
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
import * as dummy from 'testData';
import {
  retrieveValue,
  tableFields,
  formatInstructors,
  formatMeetings,
  formatFacultyNotes,
} from '../tableFields';
import { PGTime } from '../../../../../common/utils/PGTime';

describe('tableFields', function () {
  let openModalSpy: SinonSpy;
  beforeEach(function () {
    openModalSpy = spy();
  });
  describe('helper functions', function () {
    describe('retrieveValue', function () {
      it('should return a component to render course-level fields', function () {
        const CatalogNumber = retrieveValue('catalogNumber');
        const { getByText } = render(
          <CatalogNumber course={cs50CourseInstance} />
        );
        return getByText(cs50CourseInstance.catalogNumber);
      });
      it('Should return a component to render a fall level field', function () {
        const FallEnrollment = retrieveValue('actualEnrollment', TERM.FALL);
        const { getByText } = render(
          <FallEnrollment course={cs50CourseInstance} />
        );
        return getByText(`${cs50CourseInstance.fall.actualEnrollment}`);
      });
      it('Should return a component to render a spring level field', function () {
        const SpringEnrollment = retrieveValue('actualEnrollment', TERM.SPRING);
        const { getByText } = render(
          <SpringEnrollment course={{
            ...cs50CourseInstance,
            spring: {
              ...cs50CourseInstance.spring,
              actualEnrollment: dummy.int,
            },
          }}
          />
        );
        return getByText(`${dummy.int}`);
      });
      it('should return a component that renders true booleans as "Yes"', function () {
        const BooleanValue = retrieveValue('isUndergraduate');
        const { getByText } = render(
          <BooleanValue
            course={{ ...cs50CourseInstance, isUndergraduate: true }}
          />
        );
        return getByText('Yes');
      });
      it('should return a component that renders false booleans as "No"', function () {
        const BooleanValue = retrieveValue('isUndergraduate');
        const { getByText } = render(
          <BooleanValue
            course={{ ...cs50CourseInstance, isUndergraduate: false }}
          />
        );
        return getByText('No');
      });
      it('Should return a component that renders IS_SEAS.Y as "Yes"', function () {
        const IsSEASValue = retrieveValue('isSEAS');
        const { getByText } = render(
          <IsSEASValue
            course={{
              ...cs50CourseInstance,
              isSEAS: IS_SEAS.Y,
            }}
          />
        );
        return getByText(isSEASEnumToString(IS_SEAS.Y));
      });
      it('Should return a component that renders IS_SEAS.N as "No"', function () {
        const IsSEASValue = retrieveValue('isSEAS');
        const { getByText } = render(
          <IsSEASValue
            course={{
              ...cs50CourseInstance,
              isSEAS: IS_SEAS.N,
            }}
          />
        );
        return getByText(isSEASEnumToString(IS_SEAS.N));
      });
      it('Should return a component that renders IS_SEAS.EPS as "EPS"', function () {
        const IsSEASValue = retrieveValue('isSEAS');
        const { getByText } = render(
          <IsSEASValue
            course={{
              ...cs50CourseInstance,
              isSEAS: IS_SEAS.EPS,
            }}
          />
        );
        return getByText(isSEASEnumToString(IS_SEAS.EPS));
      });
    });
    describe('formatInstructors', function () {
      let TestComponent: FunctionComponent<unknown>;
      context('When course has data', function () {
        context('When user is able to edit', function () {
          beforeEach(function () {
            const FallInstructors = formatInstructors(TERM.FALL);
            TestComponent = () => (
              <div>
                <FallInstructors
                  course={ac209aCourseInstance}
                  openInstructorModal={openModalSpy}
                  buttonRef={null}
                  isEditable
                />
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
        context('When user is NOT able to edit', function () {
          beforeEach(function () {
            const FallInstructors = formatInstructors(TERM.FALL);
            TestComponent = () => (
              <div>
                <FallInstructors
                  course={ac209aCourseInstance}
                  openInstructorModal={openModalSpy}
                  buttonRef={null}
                />
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
          it('Should NOT render an edit button', function () {
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
            strictEqual(
              editButton,
              null
            );
          });
        });
      });
      context('When semester does not have any instructors', function () {
        context('When user is able to edit', function () {
          beforeEach(function () {
            const SpringInstructors = formatInstructors(TERM.SPRING);
            TestComponent = () => (
              <div>
                <SpringInstructors
                  course={ac209aCourseInstance}
                  openInstructorModal={openModalSpy}
                  buttonRef={null}
                  isEditable
                />
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
        context('When user is NOT able to edit', function () {
          beforeEach(function () {
            const SpringInstructors = formatInstructors(TERM.SPRING);
            TestComponent = () => (
              <div>
                <SpringInstructors
                  course={ac209aCourseInstance}
                  openInstructorModal={openModalSpy}
                  buttonRef={null}
                />
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
            strictEqual(
              editButton,
              null
            );
          });
        });
      });
    });
    describe('formatMeetings', function () {
      context('When semester has data', function () {
        context('With times and rooms', function () {
          it('Should return a component that renders days, times and rooms as a list', function () {
            const FallMeetings = formatMeetings(TERM.FALL);
            const TestComponent: FunctionComponent = (): ReactElement => (
              <div>
                <FallMeetings
                  course={ac209aCourseInstance}
                  openInstructorModal={openModalSpy}
                  buttonRef={null}
                />
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
            const FallMeetings = formatMeetings(TERM.FALL);
            const TestComponent: FunctionComponent = (): ReactElement => (
              <div>
                <FallMeetings
                  course={ac209aCourseInstanceWithoutRooms}
                  openInstructorModal={openModalSpy}
                  buttonRef={null}
                />
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
          const SpringMeetings = formatMeetings(TERM.SPRING);
          const TestComponent: FunctionComponent = (): ReactElement => (
            <div>
              <SpringMeetings
                course={ac209aCourseInstance}
                openInstructorModal={openModalSpy}
                buttonRef={null}
              />
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
      context('Course with Notes', function () {
        it('renders a button to view/edit notes', function () {
          const notesField = tableFields.find(({ viewColumn }): boolean => (
            viewColumn === COURSE_TABLE_COLUMN.NOTES));
          const Notes = notesField.FieldContent;
          return render(
            <Notes course={ac209aCourseInstance} />
          ).findByLabelText(/View\/Edit notes/i);
        });
      });
      context('Course without notes', function () {
        it('renders a button to add notes', function () {
          const notesField = tableFields.find(({ viewColumn }): boolean => (
            viewColumn === COURSE_TABLE_COLUMN.NOTES));
          const Notes = notesField.FieldContent;
          return render(
            <Notes course={cs50CourseInstance} />
          ).findByLabelText(/Add notes/i);
        });
      });
    });
  });
});
