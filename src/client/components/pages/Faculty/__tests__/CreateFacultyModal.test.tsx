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

describe('Faculty Admin Modals', function () {
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
    });
    context('when no fields have been filled in', function () {
      it('renders an empty course area field', async function () {
        const courseAreaSelect = document.getElementById('createFacultyCourseArea') as HTMLSelectElement;
        strictEqual(courseAreaSelect.value, '');
      });
      it('renders an empty HUID field', async function () {
        const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
        strictEqual(huidInput.value, '');
      });
      it('renders an empty first name field', async function () {
        const firstNameInput = document.getElementById('createFacultyFirstName') as HTMLInputElement;
        strictEqual(firstNameInput.value, '');
      });
      it('renders an empty last name field', async function () {
        const lastNameInput = document.getElementById('createFacultyLastName') as HTMLInputElement;
        strictEqual(lastNameInput.value, '');
      });
      it('renders an empty joint with field', async function () {
        const jointWithInput = document.getElementById('createFacultyJointWith') as HTMLSelectElement;
        strictEqual(jointWithInput.value, '');
      });
      it('renders an empty faculty category field', async function () {
        const categorySelect = document.getElementById('createFacultyCategory') as HTMLSelectElement;
        strictEqual(categorySelect.value, '');
      });
      it('renders no error messages', function () {
        strictEqual(queryAllByRole('alert').length, 0);
      });
    });
    context('when the fields are filled in', function () {
      beforeEach(async function () {
        newFacultyInfo = {
          area: 'AM',
          HUID: '12345678',
          lastName: 'Townson',
          firstName: 'Olive',
          category: FACULTY_TYPE.LADDER,
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
      });
      it('displays the appropriate validation error when the course area is not supplied', async function () {
        const courseAreaSelect = document.getElementById('createFacultyCourseArea') as HTMLSelectElement;
        fireEvent.change(courseAreaSelect, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'area is required to submit';
        return waitForElement(() => getByText(errorMessage, { exact: false }));
      });
      it('displays the appropriate validation error when the HUID is not supplied', async function () {
        const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
        fireEvent.change(huidInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'An HUID is required';
        return waitForElement(() => getByText(errorMessage, { exact: false }));
      });
      it('displays the appropriate validation error when the HUID is invalid', async function () {
        const huidInput = document.getElementById('createFacultyHUID') as HTMLInputElement;
        fireEvent.change(huidInput, { target: { value: '123' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'An HUID is required and must contain 8 digits';
        return waitForElement(() => getByText(errorMessage, { exact: false }));
      });
      it('displays the appropriate validation error when the last name is not supplied', async function () {
        const lastNameInput = document.getElementById('createFacultyLastName') as HTMLInputElement;
        fireEvent.change(lastNameInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'last name is required to submit';
        return waitForElement(() => getByText(errorMessage, { exact: false }));
      });
      it('displays the appropriate validation error when the faculty category is not supplied', async function () {
        const facultyCategorySelect = document.getElementById('createFacultyCategory') as HTMLSelectElement;
        fireEvent.change(facultyCategorySelect, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'category is required to submit';
        return waitForElement(() => getByText(errorMessage, { exact: false }));
      });
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
});
