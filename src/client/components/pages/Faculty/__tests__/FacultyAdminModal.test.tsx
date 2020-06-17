import { strictEqual } from 'assert';
import { validHUID } from 'common/__tests__/utils/facultyHelperFunctions';
import {
  waitForElement,
  fireEvent,
  BoundFunction,
  GetByText,
} from '@testing-library/react';
import React from 'react';
import {
  SinonStub,
  stub,
} from 'sinon';
import { render } from 'test-utils';
import { testMetadata } from 'common/__tests__/data/metadata';
import FacultyAdmin from '../../FacultyAdmin';

describe('Faculty Admin Modal', function () {
  let dispatchMessage: SinonStub;
  describe('Helper function', function () {
    describe('validHUID', function () {
      it('should return false when the provided string contains at least one letter', function () {
        strictEqual(validHUID('a1234567'), false);
      });
      it('should return false when the provided string contains at least one symbol', function () {
        strictEqual(validHUID('12$45678'), false);
      });
      it('should return false when the HUID has a length shorter than 8 characters', function () {
        strictEqual(validHUID('1234567'), false);
      });
      it('should return false when the HUID has a length longer than 8 characters', function () {
        strictEqual(validHUID('123456789'), false);
      });
      it('should return true when the provided string contains 8 digits', function () {
        strictEqual(validHUID('12345678'), true);
      });
    });
  });
  describe('Create Faculty Admin Modal', function () {
    let getByText: BoundFunction<GetByText>;
    beforeEach(async function () {
      dispatchMessage = stub();
      ({ getByText } = render(
        <FacultyAdmin />,
        dispatchMessage,
        testMetadata
      ));
      const createFacultyButtonText = 'Create New Faculty';
      await waitForElement(() => getByText(createFacultyButtonText));
      fireEvent.click(getByText(createFacultyButtonText));
      const courseAreaSelect = document.getElementById('createFacultyCourseArea') as HTMLSelectElement;
      // Pick the first option after the blank
      fireEvent.change(courseAreaSelect,
        { target: { value: courseAreaSelect.options[1].value } });
      const facultyCategorySelect = document.getElementById('createFacultyCategory') as HTMLSelectElement;
      // Pick the first option after the blank
      fireEvent.change(facultyCategorySelect,
        { target: { value: facultyCategorySelect.options[1].value } });
      const firstNameInput = document.getElementById('createFacultyFirstName') as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      const lastNameInput = document.getElementById('createFacultyLastName') as HTMLInputElement;
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
      const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
      fireEvent.change(huidInput, { target: { value: '12345678' } });
    });
    it('displays the appropriate validation error when the HUID is invalid', async function () {
      const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
      fireEvent.change(huidInput, { target: { value: '123' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'HUID must contain 8 digits';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
    it('displays the appropriate validation error when neither the first or last name are supplied', async function () {
      const lastNameInput = document.getElementById('createFacultyLastName') as HTMLInputElement;
      fireEvent.change(lastNameInput, { target: { value: '' } });
      const firstNameInput = document.getElementById('createFacultyFirstName') as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: '' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'At least a first or last name must be provided';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
    it('displays the appropriate validation error when the course area is not supplied', async function () {
      const courseAreaSelect = document.getElementById('createFacultyCourseArea') as HTMLSelectElement;
      fireEvent.change(courseAreaSelect, { target: { value: '' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'Please fill in the required fields and try again';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
    it('displays the appropriate validation error when the faculty category is not supplied', async function () {
      const facultyCategorySelect = document.getElementById('createFacultyCategory') as HTMLSelectElement;
      fireEvent.change(facultyCategorySelect, { target: { value: '' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'Please fill in the required fields and try again';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
  });
});
