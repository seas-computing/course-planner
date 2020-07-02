import {
  strictEqual,
  deepStrictEqual,
} from 'assert';
import { validHUID } from 'common/__tests__/utils/facultyHelperFunctions';
import {
  waitForElement,
  fireEvent,
  BoundFunction,
  GetByText,
  AllByRole,
} from '@testing-library/react';
import React from 'react';
import {
  SinonStub,
  stub,
} from 'sinon';
import { render } from 'test-utils';
import { testMetadata } from 'common/__tests__/data/metadata';
import { FacultyAPI } from 'client/api';
import {
  bioengineeringFacultyMemberResponse,
  appliedMathFacultyMemberResponse,
} from 'testData';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { FACULTY_TYPE } from 'common/constants';
import { CreateFacultyDTO } from 'common/dto/faculty/CreateFaculty.dto';
import FacultyAdmin from '../../FacultyAdmin';

describe('Create Faculty Modal', function () {
  let dispatchMessage: SinonStub;
  let getStub: SinonStub;
  let postStub: SinonStub;
  let getByText: BoundFunction<GetByText>;
  let getAllByRole: BoundFunction<AllByRole>;
  let queryAllByRole: BoundFunction<AllByRole>;
  let newFacultyInfo: CreateFacultyDTO;
  const newFacultyInfoId = '5c8e015f-eae6-4586-9eb0-fc7d243403bf';
  beforeEach(async function () {
    getStub = stub(FacultyAPI, 'getAllFacultyMembers');
    getStub.resolves([
      bioengineeringFacultyMemberResponse,
      appliedMathFacultyMemberResponse,
    ] as ManageFacultyResponseDTO[]);
    postStub = stub(FacultyAPI, 'createFaculty');
    postStub.callsFake((facultyInfo: CreateFacultyDTO) => ({
      ...facultyInfo,
      id: newFacultyInfoId,
      area: {
        id: '464e1579-70e4-43e9-afa0-4d94392b6d9d',
        name: facultyInfo.area,
      },
    }));
    dispatchMessage = stub();
    ({ getByText, getAllByRole, queryAllByRole } = render(
      <FacultyAdmin />,
      dispatchMessage,
      testMetadata
    ));
    const createFacultyButtonText = 'Create New Faculty';
    await waitForElement(() => getByText(createFacultyButtonText));
    fireEvent.click(getByText(createFacultyButtonText));
    newFacultyInfo = {
      area: 'AM',
      HUID: '12345678',
      lastName: 'Townson',
      firstName: 'Olive',
      category: FACULTY_TYPE.LADDER,
      jointWith: 'CS 350',
    };
    const courseAreaSelect = document.getElementById('createFacultyCourseArea') as HTMLSelectElement;
    fireEvent.change(courseAreaSelect,
      { target: { value: newFacultyInfo.area } });
    const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
    fireEvent.change(huidInput,
      { target: { value: newFacultyInfo.HUID } });
    const firstNameInput = document.getElementById('createFacultyFirstName') as HTMLInputElement;
    fireEvent.change(firstNameInput,
      { target: { value: newFacultyInfo.firstName } });
    const lastNameInput = document.getElementById('createFacultyLastName') as HTMLInputElement;
    fireEvent.change(lastNameInput,
      { target: { value: newFacultyInfo.lastName } });
    const facultyCategorySelect = document.getElementById('createFacultyCategory') as HTMLSelectElement;
    fireEvent.change(facultyCategorySelect,
      { target: { value: newFacultyInfo.category } });
    const jointWithInput = document.getElementById('createFacultyJointWith') as HTMLInputElement;
    fireEvent.change(jointWithInput,
      { target: { value: newFacultyInfo.jointWith } });
  });
  describe('On Close Behavior', function () {
    it('clears all form fields', async function () {
      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);
      const createFacultyButtonText = 'Create New Faculty';
      await waitForElement(() => getByText(createFacultyButtonText));
      fireEvent.click(getByText(createFacultyButtonText));
      const courseAreaSelect = document.getElementById('createFacultyCourseArea') as HTMLSelectElement;
      const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
      const firstNameInput = document.getElementById('createFacultyFirstName') as HTMLInputElement;
      const lastNameInput = document.getElementById('createFacultyLastName') as HTMLInputElement;
      const facultyCategorySelect = document.getElementById('createFacultyCategory') as HTMLSelectElement;
      const jointWithInput = document.getElementById('createFacultyJointWith') as HTMLInputElement;
      strictEqual(courseAreaSelect.value, '');
      strictEqual(huidInput.value, '');
      strictEqual(firstNameInput.value, '');
      strictEqual(lastNameInput.value, '');
      strictEqual(facultyCategorySelect.value, '');
      strictEqual(jointWithInput.value, '');
    });
  });
  describe('Field Validation', function () {
    describe('Area', function () {
      it('is a required field', async function () {
        const courseAreaSelect = document.getElementById('createFacultyCourseArea') as HTMLSelectElement;
        fireEvent.change(courseAreaSelect, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'area is required to submit';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
    });
    describe('HUID', function () {
      it('is a required field', async function () {
        const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
        fireEvent.change(huidInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'HUID is required';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
      it('raises an error message when not supplied', async function () {
        const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
        fireEvent.change(huidInput, { target: { value: '123' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'HUID is required and must contain 8 digits';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
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
    describe('First name', function () {
      it('is not a required field', async function () {
        const firstNameInput = document.getElementById('createFacultyFirstName') as HTMLInputElement;
        fireEvent.change(firstNameInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        strictEqual(queryAllByRole('alert').length, 0);
      });
    });
    describe('Last name', function () {
      it('is a required field', async function () {
        const lastNameInput = document.getElementById('createFacultyLastName') as HTMLInputElement;
        fireEvent.change(lastNameInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'last name is required to submit';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
    });
    describe('Category', function () {
      it('is a required field', async function () {
        const facultyCategorySelect = document.getElementById('createFacultyCategory') as HTMLSelectElement;
        fireEvent.change(facultyCategorySelect, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'category is required to submit';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
    });
    describe('Joint With', function () {
      it('is not a required field', async function () {
        const jointWithInput = document.getElementById('createFacultyJointWith') as HTMLInputElement;
        fireEvent.change(jointWithInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        strictEqual(queryAllByRole('alert').length, 0);
      });
    });
  });
  describe('Resulting display', function () {
    it('sorts the updated list of faculty by area, last name, and first name ascending on modal submission', async function () {
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      await waitForElement(() => getByText(
        newFacultyInfo.lastName, { exact: false }
      ));
      const ids = getAllByRole('button')
        .filter((button) => button.id && button.id.startsWith('editFaculty'))
        .map((button) => button.id);
      const idsInExpectedOrder = [
        // area: AM, last name: Lee
        appliedMathFacultyMemberResponse.id,
        // area: AM, last name: Townson
        newFacultyInfoId,
        // area: BE, last name: Su
        bioengineeringFacultyMemberResponse.id,
      ].map((id) => `editFaculty${id}`);
      deepStrictEqual(ids, idsInExpectedOrder);
    });
  });
});
