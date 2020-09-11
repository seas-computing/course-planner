import {
  strictEqual,
} from 'assert';
import { validHUID } from 'common/utils/facultyHelperFunctions';
import {
  waitForElement,
  fireEvent,
  BoundFunction,
  GetByText,
  AllByRole,
  wait,
} from '@testing-library/react';
import React from 'react';
import {
  SinonStub,
  stub,
} from 'sinon';
import { render } from 'common/utils';
import { testMetadata } from 'common/data/metadata';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { FACULTY_TYPE } from 'common/constants';
import request from 'client/api/request';
import FacultyModal from '../../FacultyModal';

describe('Faculty Modal', function () {
  context('When creating a new faculty member', function () {
    let getByText: BoundFunction<GetByText>;
    let queryAllByRole: BoundFunction<AllByRole>;
    let getByLabelText: BoundFunction<GetByText>;
    const dispatchMessage: SinonStub = stub();
    let onSuccessStub: SinonStub;
    let putStub: SinonStub;
    let postStub: SinonStub;
    const facultyInfo: ManageFacultyResponseDTO = {
      id: '5c8e015f-eae6-4586-9eb0-fc7d243403bf',
      area: {
        id: '464e1579-70e4-43e9-afa0-4d94392b6d9d',
        name: 'AM',
      },
      HUID: '12345678',
      lastName: 'Townson',
      firstName: 'Olive',
      category: FACULTY_TYPE.LADDER,
      jointWith: 'CS 350',
      notes: 'Prefers Allston campus',
    };
    describe('On Open Behavior', function () {
      context('when currentFaculty is null', function () {
        beforeEach(async function () {
          ({ getByLabelText, queryAllByRole } = render(
            <FacultyModal isVisible />,
            dispatchMessage,
            testMetadata
          ));
        });
        it('renders a modal with all empty form fields', async function () {
          const courseAreaSelect = getByLabelText('Area', { exact: false }) as HTMLSelectElement;
          const huidInput = getByLabelText('HUID', { exact: false }) as HTMLInputElement;
          const firstNameInput = getByLabelText('First name', { exact: false }) as HTMLInputElement;
          const lastNameInput = getByLabelText('Last name', { exact: false }) as HTMLInputElement;
          const facultyCategorySelect = getByLabelText('Category', { exact: false }) as HTMLSelectElement;
          const jointWithInput = getByLabelText('Joint with', { exact: false }) as HTMLInputElement;
          const notesInput = getByLabelText('Notes', { exact: false }) as HTMLInputElement;
          strictEqual(courseAreaSelect.value, '');
          strictEqual(huidInput.value, '');
          strictEqual(firstNameInput.value, '');
          strictEqual(lastNameInput.value, '');
          strictEqual(facultyCategorySelect.value, '');
          strictEqual(jointWithInput.value, '');
          strictEqual(notesInput.value, '');
        });
        it('renders no error messages prior to initial form submission', async function () {
          strictEqual(queryAllByRole('alert').length, 0);
        });
      });
      context('when currentFaculty is not null', function () {
        beforeEach(async function () {
          ({ getByLabelText, queryAllByRole } = render(
            <FacultyModal
              isVisible
              currentFaculty={facultyInfo}
            />,
            dispatchMessage,
            testMetadata
          ));
        });
        it('populates the modal fields according to the current faculty selected', async function () {
          const courseAreaSelect = getByLabelText('Area', { exact: false }) as HTMLSelectElement;
          const huidInput = getByLabelText('HUID', { exact: false }) as HTMLInputElement;
          const firstNameInput = getByLabelText('First name', { exact: false }) as HTMLInputElement;
          const lastNameInput = getByLabelText('Last name', { exact: false }) as HTMLInputElement;
          const facultyCategorySelect = getByLabelText('Category', { exact: false }) as HTMLSelectElement;
          const jointWithInput = getByLabelText('Joint with', { exact: false }) as HTMLInputElement;
          const notesInput = getByLabelText('Notes', { exact: false }) as HTMLInputElement;
          strictEqual(courseAreaSelect.value, facultyInfo.area.name);
          strictEqual(huidInput.value, facultyInfo.HUID);
          strictEqual(firstNameInput.value, facultyInfo.firstName);
          strictEqual(lastNameInput.value, facultyInfo.lastName);
          strictEqual(facultyCategorySelect.value, facultyInfo.category);
          strictEqual(jointWithInput.value, facultyInfo.jointWith);
          strictEqual(notesInput.value, facultyInfo.notes);
        });
        it('renders no error messages prior to initial form submission', async function () {
          strictEqual(queryAllByRole('alert').length, 0);
        });
      });
    });
    describe('Field Validation', function () {
      beforeEach(async function () {
        ({ getByLabelText, queryAllByRole, getByText } = render(
          <FacultyModal
            isVisible
            currentFaculty={facultyInfo}
          />,
          dispatchMessage,
          testMetadata
        ));
      });
      describe('Area', function () {
        it('is a required field', async function () {
          const courseAreaSelect = getByLabelText('Area', { exact: false }) as HTMLSelectElement;
          fireEvent.change(courseAreaSelect, { target: { value: '' } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          const errorMessage = 'Area is required to submit';
          return waitForElement(
            () => getByText(errorMessage, { exact: false })
          );
        });
      });
      describe('HUID', function () {
        it('is a required field', async function () {
          const huidInput = getByLabelText('HUID', { exact: false }) as HTMLInputElement;
          fireEvent.change(huidInput, { target: { value: '' } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          const errorMessage = 'HUID is required';
          return waitForElement(
            () => getByText(errorMessage, { exact: false })
          );
        });
        it('raises an appropriate error message when not valid', async function () {
          const huidInput = getByLabelText('HUID', { exact: false }) as HTMLInputElement;
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
          const firstNameInput = getByLabelText('First name', { exact: false }) as HTMLInputElement;
          fireEvent.change(firstNameInput, { target: { value: '' } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          strictEqual(queryAllByRole('alert').length, 0);
        });
      });
      describe('Last name', function () {
        it('is a required field', async function () {
          const lastNameInput = getByLabelText('Last name', { exact: false }) as HTMLInputElement;
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
          const facultyCategorySelect = getByLabelText('Category', { exact: false }) as HTMLSelectElement;
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
          const jointWithInput = getByLabelText('Joint with', { exact: false }) as HTMLInputElement;
          fireEvent.change(jointWithInput, { target: { value: '' } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          strictEqual(queryAllByRole('alert').length, 0);
        });
      });
      describe('Notes', function () {
        it('is not a required field', async function () {
          const notesInput = getByLabelText('Notes', { exact: false }) as HTMLInputElement;
          fireEvent.change(notesInput, { target: { value: '' } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          strictEqual(queryAllByRole('alert').length, 0);
        });
      });
    });
    describe('Submit Behavior', function () {
      context('when current faculty is not null', function () {
        context('when required form fields are provided', function () {
          beforeEach(async function () {
            putStub = stub(request, 'put');
            putStub.resolves({ data: facultyInfo });
            onSuccessStub = stub();
            ({ getByLabelText, getByText } = render(
              <FacultyModal
                isVisible
                currentFaculty={facultyInfo}
                onSuccess={onSuccessStub}
              />,
              dispatchMessage,
              testMetadata
            ));
          });
          it('calls the onSuccess handler once on submit', async function () {
            const submitButton = getByText('Submit');
            fireEvent.click(submitButton);
            await wait(() => strictEqual(onSuccessStub.callCount, 1));
          });
          it('calls the onSuccess handler with the provided arguments', async function () {
            const submitButton = getByText('Submit');
            fireEvent.click(submitButton);
            await wait(() => strictEqual(
              onSuccessStub.args[0][0],
              facultyInfo
            ));
          });
        });
        context('when required form fields are not provided', function () {
          beforeEach(async function () {
            putStub = stub(request, 'put');
            onSuccessStub = stub();
            ({ getByLabelText, getByText } = render(
              <FacultyModal
                isVisible
                currentFaculty={{
                  ...facultyInfo,
                  HUID: '',
                }}
                onSuccess={onSuccessStub}
              />,
              dispatchMessage,
              testMetadata
            ));
          });
          it('does not call the onSuccess handler on submit', async function () {
            const submitButton = getByText('Submit');
            fireEvent.click(submitButton);
            await wait(() => strictEqual(onSuccessStub.callCount, 0));
          });
        });
      });
      context('when current faculty is null', function () {
        context('when required form fields are provided', function () {
          beforeEach(async function () {
            postStub = stub(request, 'post');
            postStub.resolves({ data: facultyInfo });
            onSuccessStub = stub();
            ({ getByLabelText, getByText } = render(
              <FacultyModal
                isVisible
                onSuccess={onSuccessStub}
              />,
              dispatchMessage,
              testMetadata
            ));
            const courseAreaSelect = getByLabelText('Area', { exact: false }) as HTMLSelectElement;
            fireEvent.change(
              courseAreaSelect,
              { target: { value: facultyInfo.area.name } }
            );
            const huidInput = getByLabelText('HUID', { exact: false }) as HTMLInputElement;
            fireEvent.change(
              huidInput,
              { target: { value: facultyInfo.HUID } }
            );
            const lastNameInput = getByLabelText('Last name', { exact: false }) as HTMLInputElement;
            fireEvent.change(
              lastNameInput,
              { target: { value: facultyInfo.lastName } }
            );
            const facultyCategorySelect = getByLabelText('Category', { exact: false }) as HTMLSelectElement;
            fireEvent.change(
              facultyCategorySelect,
              { target: { value: facultyInfo.category } }
            );
            const submitButton = getByText('Submit');
            fireEvent.click(submitButton);
          });
          it('calls the onSuccess handler on submit', async function () {
            await wait(() => strictEqual(onSuccessStub.callCount, 1));
          });
          it('calls the onSuccess handler with the provided arguments', async function () {
            await wait(() => strictEqual(
              onSuccessStub.args[0][0],
              facultyInfo
            ));
          });
        });
        context('when required form fields are not provided', function () {
          beforeEach(async function () {
            postStub = stub(request, 'post');
            postStub.resolves({ data: facultyInfo });
            onSuccessStub = stub();
            ({ getByLabelText, getByText } = render(
              <FacultyModal
                isVisible
                onSuccess={onSuccessStub}
              />,
              dispatchMessage,
              testMetadata
            ));
            const submitButton = getByText('Submit');
            fireEvent.click(submitButton);
          });
          it('does not call the onSuccess handler on submit', async function () {
            const submitButton = getByText('Submit');
            fireEvent.click(submitButton);
            await wait(() => strictEqual(onSuccessStub.callCount, 0));
          });
        });
      });
    });
  });
});
