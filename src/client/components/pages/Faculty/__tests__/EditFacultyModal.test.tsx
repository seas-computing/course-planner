import {
  strictEqual,
  deepStrictEqual,
} from 'assert';
import {
  waitForElement,
  fireEvent,
  BoundFunction,
  GetByText,
  wait,
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
  physicsFacultyMemberResponse,
  bioengineeringFacultyMemberResponse,
  appliedMathFacultyMemberResponse,
  anotherPhysicsFacultyMemberResponse,
} from 'testData';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import FacultyAdmin from '../../FacultyAdmin';

describe('Faculty Admin Modals', function () {
  let dispatchMessage: SinonStub;
  describe('Edit Faculty Admin Modal', function () {
    let getStub: SinonStub;
    let editStub: SinonStub;
    let getByText: BoundFunction<GetByText>;
    let getAllByRole: BoundFunction<AllByRole>;
    let queryAllByRole: BoundFunction<AllByRole>;
    let newLastName: string;
    beforeEach(async function () {
      getStub = stub(FacultyAPI, 'getAllFacultyMembers');
      getStub.resolves([
        physicsFacultyMemberResponse,
        bioengineeringFacultyMemberResponse,
        appliedMathFacultyMemberResponse,
        anotherPhysicsFacultyMemberResponse,
      ] as ManageFacultyResponseDTO[]);
      newLastName = 'Hudson';
      editStub = stub(FacultyAPI, 'editFaculty');
      editStub.resolves({
        ...physicsFacultyMemberResponse,
        lastName: newLastName,
      });
      dispatchMessage = stub();
      ({ getByText, getAllByRole, queryAllByRole } = render(
        <FacultyAdmin />,
        dispatchMessage,
        testMetadata
      ));
      await waitForElement(
        () => getByText(physicsFacultyMemberResponse.lastName)
      );
      const physicsFacultyEditButton = document
        .getElementById('editFaculty' + physicsFacultyMemberResponse.id);
      fireEvent.click(physicsFacultyEditButton);
      const areaDropdown = await waitForElement(() => document.getElementById('editFacultyCourseArea') as HTMLSelectElement);
      await wait(() => (
        areaDropdown.value === physicsFacultyMemberResponse.area.name
      ));
    });
    it('populates the modal with the existing faculty information', async function () {
      const courseAreaSelect = document.getElementById('editFacultyCourseArea') as HTMLSelectElement;
      const huidInput = document.getElementById('editFacultyHUID') as HTMLInputElement;
      const firstNameInput = document.getElementById('editFacultyFirstName') as HTMLInputElement;
      const lastNameInput = document.getElementById('editFacultyLastName') as HTMLInputElement;
      const jointWithInput = document.getElementById('editFacultyJointWith') as HTMLInputElement;
      const categorySelect = document.getElementById('editFacultyCategory') as HTMLSelectElement;
      strictEqual(
        courseAreaSelect.value,
        physicsFacultyMemberResponse.area.name
      );
      strictEqual(
        huidInput.value,
        physicsFacultyMemberResponse.HUID, 'HUID'
      );
      strictEqual(
        firstNameInput.value,
        physicsFacultyMemberResponse.firstName, 'first name'
      );
      strictEqual(
        lastNameInput.value,
        physicsFacultyMemberResponse.lastName, 'last name'
      );
      strictEqual(
        jointWithInput.value,
        physicsFacultyMemberResponse.jointWith || '', 'joint with'
      );
      strictEqual(
        categorySelect.value,
        physicsFacultyMemberResponse.category, 'category'
      );
    });
    it('renders no error messages prior to initial form submission', async function () {
      strictEqual(queryAllByRole('alert').length, 0);
    });
    it('displays the appropriate validation error when the course area is not supplied', async function () {
      const courseAreaSelect = document.getElementById('editFacultyCourseArea') as HTMLSelectElement;
      fireEvent.change(courseAreaSelect, { target: { value: '' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'area is required to submit';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
    it('displays the appropriate validation error when the HUID is not supplied', async function () {
      const huidInput = document.getElementById('editFacultyHUID') as HTMLInputElement;
      fireEvent.change(huidInput, { target: { value: '' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'HUID is required';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
    it('displays the appropriate validation error when the HUID is invalid', async function () {
      const huidInput = document.getElementById('editFacultyHUID') as HTMLInputElement;
      fireEvent.change(huidInput, { target: { value: '123' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'An HUID is required and must contain 8 digits';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
    it('displays the appropriate validation error when the last name is not supplied', async function () {
      const lastNameInput = document.getElementById('editFacultyLastName') as HTMLInputElement;
      fireEvent.change(lastNameInput, { target: { value: '' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'last name is required';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
    it('displays the appropriate validation error when the faculty category is not supplied', async function () {
      const facultyCategorySelect = document.getElementById('editFacultyCategory') as HTMLSelectElement;
      fireEvent.change(facultyCategorySelect, { target: { value: '' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      const errorMessage = 'category is required';
      return waitForElement(() => getByText(errorMessage, { exact: false }));
    });
    it('sorts the updated list of faculty by area, last name, and first name ascending on modal submission', async function () {
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      await waitForElement(() => getByText(
        newLastName, { exact: false }
      ));
      const ids = getAllByRole('button')
        .filter((button) => button.id && button.id.startsWith('editFaculty'))
        .map((button) => button.id);
      const idsInExpectedOrder = [
        // area: AM, last name: Lee
        appliedMathFacultyMemberResponse.id,
        // area: AP, last name: Hudson
        physicsFacultyMemberResponse.id,
        // area: AP, last name: Kenney
        anotherPhysicsFacultyMemberResponse.id,
        // area: BE, last name: Su
        bioengineeringFacultyMemberResponse.id,
      ].map((id) => `editFaculty${id}`);
      deepStrictEqual(ids, idsInExpectedOrder);
    });
  });
});
