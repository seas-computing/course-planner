import React from 'react';
import { render } from 'test-utils';
import { TERM } from 'common/constants';
import {
  fireEvent, RenderResult, within,
} from '@testing-library/react';
import * as dummy from 'testData';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { stub, SinonStub } from 'sinon';
import { strictEqual, deepStrictEqual, notStrictEqual } from 'assert';
import * as facultyAPI from '../../../../api/faculty';
import InstructorModal from '../InstructorModal';

describe('InstructorModal', function () {
  let renderResult: RenderResult;
  let testCourse: CourseInstanceResponseDTO;
  let instructorNames: string[];
  let instructorFetchStub: SinonStub;
  const term = TERM.FALL;
  const { calendarYear } = dummy.cs50CourseInstance.fall;
  const closeStub = stub();
  const saveStub = stub();
  beforeEach(function () {
    instructorFetchStub = stub(facultyAPI, 'getAllInstructors');
  });
  describe('Rendering Instructor list', function () {
    beforeEach(function () {
      instructorFetchStub.resolves([]);
    });
    context('With No Instructors', function () {
      beforeEach(function () {
        testCourse = {
          ...dummy.cs50CourseInstance,
          fall: {
            ...dummy.cs50CourseInstance.fall,
            instructors: [],
          },
        };
        renderResult = render(
          <InstructorModal
            isVisible
            currentCourse={testCourse}
            currentSemester={{ term, calendarYear }}
            closeModal={closeStub}
            onSave={saveStub}
          />
        );
      });
      it('Should not render any instructors', function () {
        const instructors = renderResult.queryAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        strictEqual(instructors.length, 0);
      });
    });
    context('With one instructor', function () {
      beforeEach(function () {
        testCourse = {
          ...dummy.cs50CourseInstance,
          fall: {
            ...dummy.cs50CourseInstance.fall,
            instructors: [
              dummy.cs50CourseInstance.fall.instructors[0],
            ],
          },
        };
        instructorNames = testCourse.fall.instructors
          .map(({ displayName }) => displayName);
        renderResult = render(
          <InstructorModal
            isVisible
            currentCourse={testCourse}
            currentSemester={{ term, calendarYear }}
            closeModal={closeStub}
            onSave={saveStub}
          />
        );
      });
      it("Should render the instructor's display name", function () {
        const instructors = renderResult.queryAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        strictEqual(instructors.length, 1);
        const renderedNames = instructors
          .map(({ textContent }) => textContent);
        deepStrictEqual(renderedNames, instructorNames);
      });
      it('should render a delete button', function () {
        const deleteButton = renderResult.queryByLabelText(
          `Remove ${instructorNames[0]} from ${testCourse.catalogNumber}`,
          { exact: false }
        );
        notStrictEqual(deleteButton, null);
      });
      it('Should not render any active arrow buttons', function () {
        const entries = renderResult.queryAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        const arrowButtons = within(entries[0]).queryAllByLabelText(
          new RegExp(`Move ${instructorNames[0]} (up|down)`)
        );
        strictEqual(arrowButtons.length, 0);
      });
    });
    context('With two instructors', function () {
      beforeEach(function () {
        testCourse = {
          ...dummy.cs50CourseInstance,
          fall: {
            ...dummy.cs50CourseInstance.fall,
            instructors: [
              dummy.cs50CourseInstance.fall.instructors[0],
              dummy.cs50CourseInstance.fall.instructors[1],
            ],
          },
        };
        instructorNames = testCourse.fall.instructors
          .map(({ displayName }) => displayName);
        renderResult = render(
          <InstructorModal
            isVisible
            currentCourse={testCourse}
            currentSemester={{ term, calendarYear }}
            closeModal={closeStub}
            onSave={saveStub}
          />
        );
      });
      it("Should render the instructors' display names", function () {
        const instructors = renderResult.queryAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        strictEqual(instructors.length, 2);
        const renderedNames = instructors
          .map(({ textContent }) => textContent);
        deepStrictEqual(renderedNames, instructorNames);
      });
      it('should render a delete button before each', function () {
        const deleteButtons = renderResult.queryAllByLabelText(
          new RegExp(`Remove (${instructorNames.join('|')}) from ${testCourse.catalogNumber}`)
        );
        strictEqual(deleteButtons.length, 2);
      });
      it('Should only render an active down arrow for the first instructor', function () {
        const entries = renderResult.getAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        const upArrowButton = within(entries[0]).queryAllByLabelText(
          `Move ${instructorNames[0]} up`,
          { exact: false }
        );
        const downArrowButton = within(entries[0]).queryAllByLabelText(
          `Move ${instructorNames[0]} down to position 2`,
          { exact: false }
        );
        strictEqual(upArrowButton.length, 0);
        strictEqual(downArrowButton.length, 1);
      });
      it('Should only render an active up arrow for the second instructor', function () {
        const entries = renderResult.getAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        const upArrowButton = within(entries[1]).queryAllByLabelText(
          `Move ${instructorNames[1]} up to position 1`,
          { exact: false }
        );
        const downArrowButton = within(entries[1]).queryAllByLabelText(
          `Move ${instructorNames[1]} down`,
          { exact: false }
        );
        strictEqual(upArrowButton.length, 1);
        strictEqual(downArrowButton.length, 0);
      });
    });
    context('With three instructors', function () {
      beforeEach(function () {
        testCourse = {
          ...dummy.cs50CourseInstance,
          fall: {
            ...dummy.cs50CourseInstance.fall,
            instructors: [
              dummy.cs50CourseInstance.fall.instructors[0],
              dummy.cs50CourseInstance.fall.instructors[1],
              dummy.cs50CourseInstance.fall.instructors[2],
            ],
          },
        };
        instructorNames = testCourse.fall.instructors
          .map(({ displayName }) => displayName);
        renderResult = render(
          <InstructorModal
            isVisible
            currentCourse={testCourse}
            currentSemester={{ term, calendarYear }}
            closeModal={closeStub}
            onSave={saveStub}
          />
        );
      });
      it("Should render the instructors' display names", function () {
        const instructors = renderResult.queryAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        strictEqual(instructors.length, 3);
        const renderedNames = instructors
          .map(({ textContent }) => textContent);
        deepStrictEqual(renderedNames, instructorNames);
      });
      it('should render a delete button before each', function () {
        const deleteButtons = renderResult.queryAllByLabelText(
          new RegExp(`Remove (${instructorNames.join('|')}) from ${testCourse.catalogNumber}`)
        );
        strictEqual(deleteButtons.length, 3);
      });
      it('Should only render an active down arrow for the first instructor', function () {
        const entries = renderResult.getAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        const upArrowButton = within(entries[0]).queryAllByLabelText(
          `Move ${instructorNames[0]} up`,
          { exact: false }
        );
        const downArrowButton = within(entries[0]).queryAllByLabelText(
          `Move ${instructorNames[0]} down to position 2`,
          { exact: false }
        );
        strictEqual(upArrowButton.length, 0);
        strictEqual(downArrowButton.length, 1);
      });
      it('Should render both an active up and an active down arrow for the second instructor', function () {
        const entries = renderResult.getAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        const upArrowButton = within(entries[1]).queryAllByLabelText(
          `Move ${instructorNames[1]} up to position 1`,
          { exact: false }
        );
        const downArrowButton = within(entries[1]).queryAllByLabelText(
          `Move ${instructorNames[1]} down to position 3`,
          { exact: false }
        );
        strictEqual(upArrowButton.length, 1);
        strictEqual(downArrowButton.length, 1);
      });
      it('Should render only an active up arrow for the third instructor', function () {
        const entries = renderResult.getAllByRole('listitem')
          .filter((li) => (within(li).queryByLabelText(/remove/i)));
        const upArrowButton = within(entries[2]).queryAllByLabelText(
          `Move ${instructorNames[2]} up to position 2`,
          { exact: false }
        );
        const downArrowButton = within(entries[2]).queryAllByLabelText(
          `Move ${instructorNames[2]} down`,
          { exact: false }
        );
        strictEqual(upArrowButton.length, 1);
        strictEqual(downArrowButton.length, 0);
      });
    });
  });
  describe('Adding Instructors', function () {
    beforeEach(function () {
      testCourse = {
        ...dummy.cs50CourseInstance,
      };
      instructorFetchStub.resolves([
        ...dummy.cs50CourseInstance.fall.instructors,
        ...dummy.ac209aCourseInstance.fall.instructors,
      ]);
      renderResult = render(
        <InstructorModal
          isVisible
          currentCourse={testCourse}
          currentSemester={{ term, calendarYear }}
          closeModal={closeStub}
          onSave={saveStub}
        />
      );
    });
    context('When searching for an instructor who is already assigned', function () {
      it('Should show a no results message', async function () {
        const [firstFaculty] = testCourse.fall.instructors;
        const addInstructorInput = renderResult.getByRole('textbox');
        fireEvent.change(
          addInstructorInput,
          {
            target: {
              value: firstFaculty.displayName,
            },
          }
        );
        return renderResult.findByText(`No results for "${firstFaculty.displayName}"`);
      });
    });
  });
});
