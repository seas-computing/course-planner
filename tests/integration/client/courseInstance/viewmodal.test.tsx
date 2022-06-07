import React from 'react';
import {
  render,
  fireEvent,
  RenderResult,
  within,
} from 'test-utils';
import CoursesPage from 'client/components/pages/Courses/CoursesPage';
import {
  physicsCourseResponse,
} from 'testData';
import { CourseAPI } from 'client/api';
import { stub } from 'sinon';
import { strictEqual } from 'assert';

describe('Customize view modal', function () {
  let coursePage: RenderResult;
  let modal: HTMLElement;
  let table: HTMLElement;

  beforeEach(async function () {
    stub(CourseAPI, 'getAllCourses').resolves([physicsCourseResponse]);
    coursePage = render(<CoursesPage />);
    const button = await coursePage.findByText(
      'Customize View',
      { exact: false }
    );
    table = coursePage.getByRole('table');
    fireEvent.click(button);
    modal = await coursePage.findByRole('dialog');
  });
  it('disappears when the "Done" button is clicked', function () {
    const doneButton = within(modal).getByText('Done');
    fireEvent.click(doneButton);
    const modalRef = coursePage.queryByRole('dialog');
    strictEqual(modalRef, null);
  });
  it('prevents a mandatory column from being hidden', async function () {
    const mandatoryColumnCheckbox = await within(modal)
      .findByLabelText('Area');
    fireEvent.click(mandatoryColumnCheckbox);

    return within(table).findByText('Area');
  });
  it('allows visible optional columns to be hidden', async function () {
    const optionalColumnCheckbox = await within(modal)
      .findByLabelText('Is SEAS?');
    fireEvent.click(optionalColumnCheckbox);

    fireEvent.click(within(modal).getByText('Done'));
    const isSeasColumn = within(table).queryByText('Is SEAS?');
    strictEqual(isSeasColumn, null);
  });
  it('allows invisible optional columns to be shown', async function () {
    const optionalColumnCheckbox = await within(modal)
      .findByLabelText('Same As');
    fireEvent.click(optionalColumnCheckbox);

    fireEvent.click(within(modal).getByText('Done'));
    return within(table).findByText('Same As');
  });
  it('re-focuses the "Customize view" button on close', async function () {
    const doneButton = within(modal).getByText('Done');
    fireEvent.click(doneButton);

    const button = await coursePage.findByText(
      'Customize View',
      { exact: false }
    );
    strictEqual(document.activeElement as HTMLElement, button);
  });
  it('focuses the header on open', function () {
    strictEqual(
      (document.activeElement as HTMLElement).textContent,
      'Customize View'
    );
  });
});
