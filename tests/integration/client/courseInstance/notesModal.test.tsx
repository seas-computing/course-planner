import { strict, strictEqual } from 'assert';
import { CourseAPI } from 'client/api';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import React from 'react';
import { SinonStub, stub } from 'sinon';
import {
  render,
  RenderResult,
  waitForElement,
  fireEvent,
  waitForElementToBeRemoved,
} from 'test-utils';
import { cs50CourseInstance } from 'testData';

describe('Notes modal', function () {
  let getStub: SinonStub;
  let postStub: SinonStub;
  const testData: CourseInstanceResponseDTO[] = [
    cs50CourseInstance,
  ];
  let page: RenderResult;

  let editNotesButton: HTMLButtonElement;
  let multiLineTextArea: HTMLTextAreaElement;
  let noteSubmitButton: HTMLButtonElement;

  beforeEach(async function () {
    getStub = stub(CourseAPI, 'getCourseInstancesForYear');
    postStub = stub(CourseAPI, 'editCourse');
    getStub.resolves(testData);

    page = render(<CoursesPage />);
    editNotesButton = await waitForElement(
      () => page.findByLabelText('notes', { exact: false }) as Promise<HTMLButtonElement>
    );
    fireEvent.click(editNotesButton);

    multiLineTextArea = page.getByLabelText(/Notes For /) as HTMLTextAreaElement;
    noteSubmitButton = page.getByText(/Save/) as HTMLButtonElement;
  });
  it('opens when the notes button is clicked beside a course', function () {
    return page.getByRole('dialog');
  });
  it('updates notes for the specified course on the server', function () {
    fireEvent.change(multiLineTextArea, {
      target: { value: 'aaa' },
    });
    fireEvent.click(noteSubmitButton);
    const { notes, id } = postStub.args[0][0];
    strictEqual(notes, 'aaa');
    strictEqual(id, testData[0].id);
  });

  it('updates notes for the specified course in local state', async function () {
    postStub.resolves();
    fireEvent.change(multiLineTextArea, {
      target: { value: 'aaa' },
    });
    fireEvent.click(noteSubmitButton);
    await waitForElementToBeRemoved(() => page.getByRole('dialog'));
    fireEvent.click(editNotesButton);
    const newMultiLineTextArea = page.getByLabelText(/Notes For /) as HTMLTextAreaElement;
    strictEqual(newMultiLineTextArea.value, 'aaa');
  });
});
