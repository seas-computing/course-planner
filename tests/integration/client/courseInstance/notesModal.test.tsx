import { strictEqual } from 'assert';
import { CourseAPI } from 'client/api';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';
import React from 'react';
import { SinonStub, stub } from 'sinon';
import {
  render,
  RenderResult,
  waitForElement,
  fireEvent,
  waitForElementToBeRemoved,
  within,
} from 'test-utils';
import { cs50CourseInstance } from 'testData';

describe('Notes modal', function () {
  let getStub: SinonStub;
  let postStub: SinonStub;
  const testData = cs50CourseInstance;
  let page: RenderResult;

  let modal: HTMLDivElement;
  let editNotesButton: HTMLButtonElement;
  let multiLineTextArea: HTMLTextAreaElement;
  let noteSubmitButton: HTMLButtonElement;
  let noteCancelButton: HTMLButtonElement;

  beforeEach(async function () {
    getStub = stub(CourseAPI, 'getCourseInstancesForYear');
    postStub = stub(CourseAPI, 'editCourse');
    getStub.resolves([testData]);

    page = render(<CoursesPage />);
    editNotesButton = await page.findByLabelText('notes', { exact: false }) as HTMLButtonElement;
    fireEvent.click(editNotesButton);

    modal = page.getByText(`Notes For ${testData.catalogNumber}`).parentElement.parentElement as HTMLDivElement;

    multiLineTextArea = within(modal)
      .getByLabelText('Course Notes', {
        selector: 'textarea',
      }) as HTMLTextAreaElement;
    noteCancelButton = within(modal).getByText(/Cancel/) as HTMLButtonElement;
    noteSubmitButton = within(modal).getByText(/Save/) as HTMLButtonElement;
  });
  it('updates notes for the specified course on the server', function () {
    postStub.resolves();
    fireEvent.change(multiLineTextArea, {
      target: { value: 'aaa' },
    });
    fireEvent.click(noteSubmitButton);
    const { notes, id } = postStub.args[0][0];
    strictEqual(notes, 'aaa');
    strictEqual(id, testData.id);
  });

  it('updates notes for the specified course in local state', async function () {
    postStub.resolves();
    fireEvent.change(multiLineTextArea, {
      target: { value: 'aaa' },
    });
    fireEvent.click(noteSubmitButton);
    await waitForElementToBeRemoved(
      () => page.getByText(`Notes For ${testData.catalogNumber}`)
    );
    // Get new reference to add/edit button since the original may have
    // replaced since the last render
    editNotesButton = await page.findByLabelText('notes', { exact: false }) as HTMLButtonElement;
    fireEvent.click(editNotesButton);
    const newMultiLineTextArea = within(modal).getByLabelText(
      'Course Notes',
      { selector: 'textarea' }
    ) as HTMLTextAreaElement;
    strictEqual(newMultiLineTextArea.value, 'aaa');
  });
  it('focuses the modal header on open', function (done) {
    setTimeout(() => {
      strictEqual(
        (document.activeElement as HTMLElement).textContent,
        `Notes For ${testData.catalogNumber}`
      );
      done();
    });
  });
  it('re-focuses the add/edit button on close', function (done) {
    fireEvent.click(noteCancelButton);
    setTimeout(() => {
      strictEqual(
        (document.activeElement as HTMLElement).textContent,
        'Add Notes'
      );
      done();
    });
  });
});
