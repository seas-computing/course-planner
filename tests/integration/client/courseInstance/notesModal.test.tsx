import { HttpStatus } from '@nestjs/common';
import { strictEqual } from 'assert';
import { AxiosResponse } from 'axios';
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
import {
  adminUser,
  cs50CourseInstance,
  string,
  readOnlyUser,
} from 'testData';

describe('Notes modal', function () {
  let getStub: SinonStub;
  let postStub: SinonStub;
  let windowConfirmStub: SinonStub;
  const testData = cs50CourseInstance;
  let page: RenderResult;

  let modal: HTMLDivElement;
  let editNotesButton: HTMLButtonElement;
  let multiLineTextArea: HTMLTextAreaElement;
  let noteSubmitButton: HTMLButtonElement;
  let noteCancelButton: HTMLButtonElement;

  beforeEach(function () {
    getStub = stub(CourseAPI, 'getCourseInstancesForYear');
    postStub = stub(CourseAPI, 'editCourse');
    windowConfirmStub = stub(window, 'confirm');
    windowConfirmStub.returns(true);
    getStub.resolves([testData]);
    postStub.resolves();
  });
  describe('open/close behaviour', function () {
    beforeEach(async function () {
      page = render(<CoursesPage />);
      editNotesButton = await page.findByLabelText(
        /Open notes for/
      ) as HTMLButtonElement;
      fireEvent.click(editNotesButton);

      modal = page.getByText(`Notes For ${testData.catalogNumber}`)
        .parentElement
        .parentElement as HTMLDivElement;

      multiLineTextArea = within(modal)
        .getByLabelText('Course Notes', {
          selector: 'textarea',
        }) as HTMLTextAreaElement;
      noteCancelButton = within(modal).getByText(/Cancel/) as HTMLButtonElement;
      noteSubmitButton = within(modal).getByText(/Save/) as HTMLButtonElement;
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
          editNotesButton.textContent
        );
        done();
      });
    });
  });
  context('user is not an admin', function () {
    beforeEach(async function () {
      page = render(<CoursesPage />, {
        currentUser: readOnlyUser,
      });
      await waitForElementToBeRemoved(
        () => page.getByText('Fetching Course Data')
      );
      editNotesButton = await page.findByLabelText(
        /Open notes for/
      ) as HTMLButtonElement;
      fireEvent.click(editNotesButton);
      modal = page
        .getByText(`Notes For ${testData.catalogNumber}`)
        .parentElement
        .parentElement as HTMLDivElement;
    });
    it('cannot change the textarea', function () {
      const textArea = within(modal)
        .getByLabelText('Course Notes', {
          selector: 'textarea',
        }) as HTMLTextAreaElement;
      const oldValue = textArea.value;
      fireEvent.change(textArea, {
        target: { value: new Date().toString() },
      });
      const newValue = textArea.value;

      // oldValue should equal newValue because the permissions should prevent
      // the value from being changed
      strictEqual(newValue, oldValue);
    });
    it('cannot see a save button', function () {
      const submitButton = within(modal)
        .queryByText('Save', { exact: false });
      strictEqual(submitButton, null);
    });
  });

  context('user is an admin', function () {
    beforeEach(async function () {
      page = render(<CoursesPage />, {
        currentUser: adminUser,
      });
      editNotesButton = await page.findByLabelText(
        /Open notes for/
      ) as HTMLButtonElement;
      fireEvent.click(editNotesButton);

      modal = page.getByText(`Notes For ${testData.catalogNumber}`)
        .parentElement
        .parentElement as HTMLDivElement;

      multiLineTextArea = within(modal)
        .getByLabelText('Course Notes', {
          selector: 'textarea',
        }) as HTMLTextAreaElement;
      noteCancelButton = within(modal).getByText(/Cancel/) as HTMLButtonElement;
      noteSubmitButton = within(modal).getByText(/Save/) as HTMLButtonElement;
    });
    it('updates notes for the specified course on the server', function () {
      fireEvent.change(multiLineTextArea, {
        target: { value: 'aaa' },
      });
      fireEvent.click(noteSubmitButton);
      const { notes, id } = postStub.args[0][0];
      strictEqual(notes, 'aaa');
      strictEqual(id, testData.id);
    });
    it('updates notes for the specified course in local state', async function () {
      fireEvent.change(multiLineTextArea, {
        target: { value: 'aaa' },
      });
      fireEvent.click(noteSubmitButton);
      await waitForElementToBeRemoved(
        () => page.getByText(`Notes For ${testData.catalogNumber}`)
      );
      // Get new reference to add/edit button since the original may have
      // replaced since the last render
      editNotesButton = await page.findByLabelText(
        /Open notes for/
      ) as HTMLButtonElement;
      fireEvent.click(editNotesButton);

      modal = page.getByText(`Notes For ${testData.catalogNumber}`)
        .parentElement
        .parentElement as HTMLDivElement;

      const newMultiLineTextArea = within(modal).getByLabelText(
        'Course Notes',
        { selector: 'textarea' }
      ) as HTMLTextAreaElement;
      strictEqual(newMultiLineTextArea.value, 'aaa');
    });
    it('prompts the user to save any un-saved changes before closing', function () {
      fireEvent.change(multiLineTextArea, {
        target: { value: string },
      });
      fireEvent.click(noteCancelButton);

      windowConfirmStub.returns(true);
      strictEqual(windowConfirmStub.callCount, 1);
    });
    it('shows a loading spinner when saving', async function () {
      fireEvent.change(multiLineTextArea, {
        target: { value: string },
      });
      fireEvent.click(noteSubmitButton);
      return waitForElement(
        () => within(modal).findByText('Saving Notes')
      );
    });
    it('reports server-side validation errors', function () {
      postStub.rejects({
        response: {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: [
              {
                property: 'termPattern',
                constraints: {
                  isEnum: 'termPattern must be a valid enum value',
                },
              },
            ],
          },
        } as Partial<AxiosResponse>,
      });
      fireEvent.change(multiLineTextArea, { target: { value: string } });
      fireEvent.click(noteSubmitButton);
      return waitForElement(
        () => within(modal).findByText(/must be a valid enum value/)
      );
    });
    it('reports misc server-side errors', function () {
      postStub.rejects({
        response: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
        } as Partial<AxiosResponse>,
      });
      fireEvent.change(multiLineTextArea, { target: { value: string } });
      fireEvent.click(noteSubmitButton);
      return waitForElement(
        () => within(modal).findByText(/please contact SEAS Computing/)
      );
    });
    it('clears existing errors between modal instances', async function () {
      postStub.rejects({
        response: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
        } as Partial<AxiosResponse>,
      });
      fireEvent.change(multiLineTextArea, { target: { value: string } });

      // Click submit to show the errors from above
      fireEvent.click(noteSubmitButton);

      // Wait for the spinner to go away
      await waitForElementToBeRemoved(() => within(modal).getByText(/saving/i));

      // Get rid of the modal so we can re-open it
      fireEvent.click(noteCancelButton);

      // Get new reference to add/edit button since the original may have
      // replaced since the last render
      editNotesButton = await page.findByLabelText(
        /Open notes for/
      ) as HTMLButtonElement;
      fireEvent.click(editNotesButton);

      modal = page.getByText(`Notes For ${testData.catalogNumber}`)
        .parentElement
        .parentElement as HTMLDivElement;

      strictEqual(
        within(modal).queryByText(/contact SEAS Computing/)
        ?.textContent || null,
        null
      );
    });
  });
});
