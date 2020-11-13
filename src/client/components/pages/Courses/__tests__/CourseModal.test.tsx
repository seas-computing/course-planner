import {
  strictEqual,
} from 'assert';
import {
  BoundFunction,
  GetByText,
  AllByRole,
  fireEvent,
  waitForElement,
  wait,
} from '@testing-library/react';
import React from 'react';
import {
  SinonStub,
  stub,
} from 'sinon';
import { render } from 'test-utils';
import request from 'client/api/request';
import { physicsCourseResponse } from 'testData';
import { IS_SEAS } from 'common/constants';
import CourseModal from '../CourseModal';

describe('Course Modal', function () {
  let getByText: BoundFunction<GetByText>;
  let queryAllByRole: BoundFunction<AllByRole>;
  let getByLabelText: BoundFunction<GetByText>;
  const dispatchMessage: SinonStub = stub();
  let onSuccessStub: SinonStub;
  let onCloseStub: SinonStub;
  let putStub: SinonStub;
  let postStub: SinonStub;
  describe('On Open Behavior', function () {
    context('when currentCourse is null', function () {
      beforeEach(function () {
        ({ getByLabelText, queryAllByRole } = render(
          <CourseModal isVisible />,
          dispatchMessage
        ));
      });
      it('renders empty form fields except for the "IS SEAS" dropdown, which defaults to "Yes"', function () {
        const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
        const newAreaInput = document.getElementById('newArea') as HTMLInputElement;
        const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
        const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
        const sameAsInput = getByLabelText('Same as', { exact: false }) as HTMLInputElement;
        const undergraduateCheckbox = getByLabelText('Undergraduate', { exact: false }) as HTMLInputElement;
        const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
        const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
        strictEqual(existingAreaSelect.value, '');
        strictEqual(newAreaInput.value, '');
        strictEqual(courseNumberInput.value, '');
        strictEqual(courseTitleInput.value, '');
        strictEqual(sameAsInput.value, '');
        strictEqual(undergraduateCheckbox.checked, false);
        strictEqual(isSEASSelect.value, IS_SEAS.Y);
        strictEqual(termPatternSelect.value, '');
      });
      it('renders no error messages prior to initial form submission', function () {
        strictEqual(queryAllByRole('alert').length, 0);
      });
    });
    context('when currentCourse is not null', function () {
      beforeEach(function () {
        ({ getByLabelText, queryAllByRole } = render(
          <CourseModal
            isVisible
            currentCourse={physicsCourseResponse}
          />,
          dispatchMessage
        ));
      });
      it('populates the modal fields according to the current course selected', function () {
        const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
        const newAreaInput = document.getElementById('newArea') as HTMLInputElement;
        const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
        const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
        const sameAsInput = getByLabelText('Same as', { exact: false }) as HTMLInputElement;
        const undergraduateCheckbox = getByLabelText('Undergraduate', { exact: false }) as HTMLInputElement;
        const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
        const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
        strictEqual(
          existingAreaSelect.value,
          physicsCourseResponse.area.name
        );
        strictEqual(
          newAreaInput.value,
          ''
        );
        strictEqual(
          courseNumberInput.value,
          physicsCourseResponse.catalogNumber
        );
        strictEqual(
          courseTitleInput.value,
          physicsCourseResponse.title
        );
        strictEqual(
          sameAsInput.value,
          physicsCourseResponse.sameAs
        );
        strictEqual(
          undergraduateCheckbox.checked,
          physicsCourseResponse.isUndergraduate
        );
        strictEqual(
          isSEASSelect.value,
          physicsCourseResponse.isSEAS
        );
        strictEqual(
          termPatternSelect.value,
          physicsCourseResponse.termPattern
        );
      });
      it('renders no error messages prior to initial form submission', function () {
        strictEqual(queryAllByRole('alert').length, 0);
      });
    });
  });
  describe('Field Validation', function () {
    beforeEach(function () {
      ({ getByLabelText, queryAllByRole, getByText } = render(
        <CourseModal
          isVisible
          currentCourse={physicsCourseResponse}
        />,
        dispatchMessage
      ));
    });
    describe('Area', function () {
      it('is a required field that should either by selected or created', async function () {
        const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
        const newAreaInput = document.getElementById('newArea') as HTMLInputElement;
        fireEvent.change(existingAreaSelect, { target: { value: '' } });
        fireEvent.change(newAreaInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'Area is required';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
      it('cannot be blank when creating a new area', async function () {
        const newAreaInput = document.getElementById('newArea') as HTMLInputElement;
        // Set the value of the new area text input field to a space
        fireEvent.change(newAreaInput, { target: { value: ' ' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'Area is required';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
      it('cannot be created if it already exists', async function () {
        const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
        const newAreaInput = document.getElementById('newArea') as HTMLInputElement;
        const newAreaRadioButton = getByLabelText('Create a new area', { exact: false }) as HTMLInputElement;
        fireEvent.click(newAreaRadioButton);
        fireEvent.change(existingAreaSelect, { target: { value: '' } });
        fireEvent.change(newAreaInput, { target: { value: 'AP' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'Area already exists';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
    });
    describe('Course Number', function () {
      it('is a required field', async function () {
        const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
        fireEvent.change(courseNumberInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'Course number is required';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
      it('must include the course prefix', async function () {
        const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
        fireEvent.change(courseNumberInput, { target: { value: '209' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'Course prefix is required';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
      it('must include the number portion of the course number', async function () {
        const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
        fireEvent.change(courseNumberInput, { target: { value: 'CS' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'A course number following the prefix entered is required';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
    });
    describe('Course Title', function () {
      it('is a required field', async function () {
        const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
        fireEvent.change(courseTitleInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'Course title is required';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
    });
    describe('Same as', function () {
      it('is not a required field', function () {
        const sameAsInput = getByLabelText('Same as', { exact: false }) as HTMLInputElement;
        fireEvent.change(sameAsInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        strictEqual(queryAllByRole('alert').length, 0);
      });
    });
    describe('Term Pattern', function () {
      it('is a required field', async function () {
        const courseTitleInput = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
        fireEvent.change(courseTitleInput, { target: { value: '' } });
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        const errorMessage = 'Term pattern is required';
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
    });
  });
  describe('Submit Behavior', function () {
    context('when current course is not null', function () {
      context('when required form fields are provided', function () {
        beforeEach(function () {
          putStub = stub(request, 'put');
          putStub.resolves({ data: physicsCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          ({ getByLabelText, getByText } = render(
            <CourseModal
              isVisible
              currentCourse={physicsCourseResponse}
              onSuccess={onSuccessStub}
              onClose={onCloseStub}
            />,
            dispatchMessage
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
            physicsCourseResponse
          ));
        });
        it('calls the onClose handler once', async function () {
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => strictEqual(onCloseStub.callCount, 1));
        });
      });
      context('when required form fields are not provided', function () {
        beforeEach(function () {
          putStub = stub(request, 'put');
          putStub.resolves({ data: physicsCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          ({ getByLabelText, getByText } = render(
            <CourseModal
              isVisible
              currentCourse={{
                ...physicsCourseResponse,
                title: '',
              }}
              onSuccess={onSuccessStub}
              onClose={onCloseStub}
            />,
            dispatchMessage
          ));
        });
        it('does not call the onSuccess handler on submit', async function () {
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => strictEqual(onSuccessStub.callCount, 0));
        });
        it('does not call the onClose handler on submit', async function () {
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => strictEqual(onCloseStub.callCount, 0));
        });
      });
    });
    context('when current course is null', function () {
      context('when required form fields are provided', function () {
        beforeEach(function () {
          postStub = stub(request, 'post');
          postStub.resolves({ data: physicsCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          ({ getByLabelText, getByText } = render(
            <CourseModal
              isVisible
              onSuccess={onSuccessStub}
              onClose={onCloseStub}
            />,
            dispatchMessage
          ));
          const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
          fireEvent.change(
            existingAreaSelect,
            { target: { value: physicsCourseResponse.area.name } }
          );
          const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
          fireEvent.change(
            courseNumberInput,
            { target: { value: physicsCourseResponse.catalogNumber } }
          );
          const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
          fireEvent.change(
            courseTitleInput,
            { target: { value: physicsCourseResponse.title } }
          );
          const undergraduateCheckbox = getByLabelText('Undergraduate', { exact: false }) as HTMLInputElement;
          fireEvent.change(
            undergraduateCheckbox,
            { target: { checked: physicsCourseResponse.isUndergraduate } }
          );
          const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
          fireEvent.change(
            isSEASSelect,
            { target: { value: physicsCourseResponse.isSEAS } }
          );
          const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
          fireEvent.change(
            termPatternSelect,
            { target: { value: physicsCourseResponse.termPattern } }
          );
        });
        it('calls the onSuccess handler on submit', async function () {
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => strictEqual(onSuccessStub.callCount, 1));
        });
        it('calls the onSuccess handler with the provided arguments', async function () {
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => strictEqual(
            onSuccessStub.args[0][0],
            physicsCourseResponse
          ));
        });
        it('calls the onClose handler once', async function () {
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => strictEqual(onCloseStub.callCount, 1));
        });
      });
      context('when required form fields are not provided', function () {
        beforeEach(function () {
          postStub = stub(request, 'post');
          postStub.resolves({ data: physicsCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          ({ getByLabelText, getByText } = render(
            <CourseModal
              isVisible
              onSuccess={onSuccessStub}
              onClose={onCloseStub}
            />,
            dispatchMessage
          ));
        });
        it('does not call the onSuccess handler on submit', async function () {
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => strictEqual(onSuccessStub.callCount, 0));
        });
        it('does not call the onClose handler on submit', async function () {
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => strictEqual(onCloseStub.callCount, 0));
        });
      });
    });
  });
});
