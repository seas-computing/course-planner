import {
  strictEqual,
} from 'assert';
import {
  BoundFunction,
  GetByText,
  AllByRole,
  fireEvent,
  wait,
  FindByText,
  QueryByText,
  waitForElement,
  within,
  RenderResult,
} from '@testing-library/react';
import React, { useState } from 'react';
import {
  SinonStub,
  stub,
} from 'sinon';
import { render } from 'test-utils';
import {
  cs50Course,
  computerScienceCourseResponse,
  metadata,
  physicsCourse,
  physicsCourseResponse,
  newAreaCourseResponse,
  activeParentCoursesExample,
} from 'testData';
import { IS_SEAS } from 'common/constants';
import request from 'client/api/request';
import { MetadataContext, MetadataContextValue } from 'client/context';
import { CourseAPI } from 'client/api';
import CourseModal from '../CourseModal';
import CourseAdmin from '../../CourseAdmin';

describe('Course Modal', function () {
  let createCourseButton: HTMLElement;
  let getByText: BoundFunction<GetByText>;
  let queryAllByRole: BoundFunction<AllByRole>;
  let getByLabelText: BoundFunction<GetByText>;
  let findByText: BoundFunction<FindByText>;
  let queryByText: BoundFunction<QueryByText>;
  const childCourse = {
    ...newAreaCourseResponse,
    sameAs: computerScienceCourseResponse.id,
  };
  const testData = [
    physicsCourseResponse,
    computerScienceCourseResponse,
    childCourse,
  ];
  let onSuccessStub: SinonStub;
  let onCloseStub: SinonStub;
  let getStub: SinonStub;
  let putStub: SinonStub;
  let postStub: SinonStub;
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getAllCourses');
    getStub.resolves(testData);
  });
  describe('On Open Behavior', function () {
    context('when currentCourse is null', function () {
      beforeEach(function () {
        ({ getByLabelText, queryAllByRole } = render(
          <CourseModal
            isVisible
            onClose={() => {}}
            onSuccess={() => null}
            courses={[]}
          />
        ));
      });
      describe('Existing Area Dropdown', function () {
        it('defaults to empty string', function () {
          const existingAreaSelect = getByLabelText('Existing Area', { exact: true }) as HTMLSelectElement;
          strictEqual(existingAreaSelect.value, '');
        });
      });
      describe('New Area Dropdown', function () {
        it('defaults to empty string', function () {
          const newAreaInput = getByLabelText('New Area', { exact: true }) as HTMLInputElement;
          strictEqual(newAreaInput.value, '');
        });
      });
      describe('Catalog Prefix Input', function () {
        it('defaults to empty string', function () {
          const catalogPrefixInput = getByLabelText('Catalog Prefix', { exact: false }) as HTMLInputElement;
          strictEqual(catalogPrefixInput.value, '');
        });
      });
      describe('Course Number Input', function () {
        it('defaults to empty string', function () {
          const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
          strictEqual(courseNumberInput.value, '');
        });
      });
      describe('Course Title Input', function () {
        it('defaults to empty string', function () {
          const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
          strictEqual(courseTitleInput.value, '');
        });
      });
      describe('Same As Input', function () {
        it('defaults to empty string', function () {
          const sameAsInput = getByLabelText('Same as', { exact: false }) as HTMLSelectElement;
          strictEqual(sameAsInput.value, '');
        });
      });
      describe('Undergraduate Checkbox', function () {
        it('defaults to being unchecked', function () {
          const undergraduateCheckbox = getByLabelText('Undergraduate', { exact: false }) as HTMLInputElement;
          strictEqual(undergraduateCheckbox.checked, false);
        });
      });
      describe('"Is SEAS" Dropdown', function () {
        it('defaults to IS_SEAS.Y', function () {
          const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
          strictEqual(isSEASSelect.value, IS_SEAS.Y);
        });
      });
      describe('Term Pattern Dropdown', function () {
        it('defaults to empty string', function () {
          const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
          strictEqual(termPatternSelect.value, '');
        });
      });
      describe('Error Message', function () {
        it('renders no error messages prior to initial form submission', function () {
          strictEqual(queryAllByRole('alert').length, 0);
        });
      });
    });
    context('when currentCourse is not null', function () {
      describe('modal field population', function () {
        let modal: RenderResult;
        beforeEach(function () {
          modal = render(
            <CourseModal
              isVisible
              currentCourse={physicsCourseResponse}
              onClose={() => {}}
              onSuccess={() => null}
              courses={testData}
            />
          );
        });
        it('populates the modal fields according to the current course selected', function () {
          const existingAreaSelect = modal.getByLabelText('Existing Area', { exact: true }) as HTMLSelectElement;
          const newAreaInput = modal.getByLabelText('New Area', { exact: true }) as HTMLInputElement;
          const catalogPrefixInput = modal.getByLabelText('Catalog Prefix', { exact: false }) as HTMLInputElement;
          const courseNumberInput = modal.getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
          const courseTitleInput = modal.getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
          const sameAsInput = modal.getByLabelText('Same as', { exact: false }) as HTMLSelectElement;
          const undergraduateCheckbox = modal.getByLabelText('Undergraduate', { exact: false }) as HTMLInputElement;
          const isSEASSelect = modal.getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
          const termPatternSelect = modal.getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
          strictEqual(
            existingAreaSelect.value,
            physicsCourseResponse.area.name
          );
          strictEqual(
            newAreaInput.value,
            ''
          );
          strictEqual(
            catalogPrefixInput.value,
            physicsCourseResponse.prefix
          );
          strictEqual(
            courseNumberInput.value,
            physicsCourseResponse.number
          );
          strictEqual(
            courseTitleInput.value,
            physicsCourseResponse.title
          );
          strictEqual(sameAsInput.value, '');
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
      });
      describe('Same As Input', function () {
        it('cannot contain the current course', function () {
          const modal = render(
            <CourseModal
              isVisible
              currentCourse={physicsCourseResponse}
              onClose={() => {}}
              onSuccess={() => null}
              courses={activeParentCoursesExample}
            />
          );
          const sameAsInput = modal.getByLabelText('Same As', { exact: false }) as HTMLSelectElement;
          const sameAsOptions = within(sameAsInput)
            .getAllByRole('option') as HTMLOptionElement[];
          const courseIds = sameAsOptions.map((option) => option.value);

          strictEqual(courseIds.includes(physicsCourseResponse.id), false);
        });
      });
      describe('Error Message', function () {
        it('renders no error messages prior to initial form submission', function () {
          strictEqual(queryAllByRole('alert').length, 0);
        });
      });
    });
  });
  describe('On Close Behavior', function () {
    context('when the create course button is clicked and the modal is up', function () {
      context('when the modal is closed', function () {
        beforeEach(async function () {
          ({ findByText, queryByText } = render(
            <CourseAdmin />
          ));
          // Show the create course modal
          createCourseButton = await findByText('Create New Course', { exact: false });
          fireEvent.click(createCourseButton);
          await findByText(/required field/);
          const cancelButton = await findByText(/Cancel/);
          // Close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText(/required field/));
        });
        it('returns focus to the create course button', function () {
          strictEqual(
            document.activeElement as HTMLElement,
            createCourseButton
          );
        });
      });
    });
    context('when an edit course button has been clicked and the modal is up', function () {
      context('when the modal is closed', function () {
        it('returns focus to the originally clicked edit faculty button', async function () {
          ({ findByText, queryByText } = render(
            <CourseAdmin />
          ));
          // Show the edit course modal
          const editCourseButton = await waitForElement(
            () => document.getElementById('editCourse' + physicsCourseResponse.id)
          );
          fireEvent.click(editCourseButton);
          await findByText(/required field/);
          const cancelButton = await findByText(/Cancel/);
          // Close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText(/required field/));
          strictEqual(
            document.activeElement as HTMLElement,
            editCourseButton
          );
        });
      });
    });
  });
  describe('Clicking Behavior', function () {
    beforeEach(function () {
      ({ getByLabelText } = render(
        <CourseModal
          isVisible
          onClose={() => {}}
          onSuccess={() => null}
          courses={[]}
        />
      ));
    });
    context('when the create new area text field is clicked', function () {
      it('selects the create new area radio button', function () {
        const newAreaInput = getByLabelText('New Area', { exact: true }) as HTMLInputElement;
        const newAreaRadioButton = getByLabelText('Create a new area', { exact: false }) as HTMLInputElement;
        fireEvent.click(newAreaInput);
        strictEqual(newAreaRadioButton.checked, true);
      });
    });
    context('when the existing area dropdown is clicked', function () {
      it('selects the existing area radio button', function () {
        const newAreaRadioButton = getByLabelText('Create a new area', { exact: false }) as HTMLInputElement;
        // Click the new area radio button first, since the course modal opens
        // with the existing area radio button checked
        fireEvent.click(newAreaRadioButton);
        const existingAreaSelect = getByLabelText('Existing Area', { exact: true }) as HTMLSelectElement;
        fireEvent.click(existingAreaSelect);
        const existingAreaRadioButton = getByLabelText('Select an existing area', { exact: false }) as HTMLInputElement;
        strictEqual(existingAreaRadioButton.checked, true);
      });
    });
  });
  describe('course area dropdown', function () {
    context('when creating a course', function () {
      beforeEach(function () {
        postStub = stub(request, 'post');
      });
      context('when a new area is added', function () {
        it('renders the newly added area to its existing area dropdown', async function () {
          postStub.resolves({ data: physicsCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          const NewAreaExample = () => {
            // Define metadata to be linked to the state
            // so that changes cause the components to rerender.
            // (The default render function, customRender,
            // does not use a rerendering metadata update.)
            const [currentMetadata, setMetadata] = useState(metadata);
            const metadataContext = new MetadataContextValue(
              currentMetadata,
              setMetadata
            );
            return (
              <MetadataContext.Provider value={metadataContext}>
                <CourseAdmin />
              </MetadataContext.Provider>
            );
          };
          ({
            findByText,
            queryByText,
            getByLabelText,
            getByText,
          } = render(
            <NewAreaExample />
          ));
          // Show the create course modal
          createCourseButton = await findByText('Create New Course', { exact: false });
          fireEvent.click(createCourseButton);
          await findByText(/required field/);
          // Fill in the required fields and create a new area
          const newArea = 'NA';
          const newAreaRadioButton = getByLabelText('Create a new area', { exact: false }) as HTMLInputElement;
          const newAreaInput = document.getElementById('newArea') as HTMLInputElement;
          const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
          const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
          const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
          fireEvent.click(newAreaRadioButton);
          fireEvent.change(newAreaInput, { target: { value: newArea } });
          fireEvent.change(courseTitleInput, { target: { value: `${physicsCourse.title}` } });
          fireEvent.change(isSEASSelect, { target: { value: `${physicsCourse.isSEAS}` } });
          fireEvent.change(termPatternSelect, { target: { value: `${physicsCourse.termPattern}` } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => !queryByText(/required field/));
          // Check that the new area that was created appears in the course admin existing areas dropdown
          fireEvent.click(createCourseButton);
          await findByText(/required field/);
          const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
          const existingAreas = Array.from(existingAreaSelect.options);
          const isNewAreaIncluded = existingAreas
            .some((area) => area.text === newArea);
          strictEqual(isNewAreaIncluded, true);
        });
      });
      context('when an existing area is selected', function () {
        it('does not re-add the existing area to the area dropdown', async function () {
          postStub.resolves({ data: physicsCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          const ExistingAreaExample = () => {
            // Define metadata to be linked to the state
            // so that changes cause the components to rerender.
            // (The default render function, customRender,
            // does not use a rerendering metadata update.)
            const [currentMetadata, setMetadata] = useState(metadata);
            const metadataContext = new MetadataContextValue(
              currentMetadata,
              setMetadata
            );
            return (
              <MetadataContext.Provider value={metadataContext}>
                <CourseAdmin />
              </MetadataContext.Provider>
            );
          };
          ({
            findByText,
            queryByText,
            getByLabelText,
            getByText,
          } = render(
            <ExistingAreaExample />
          ));
          // Show the create course modal
          createCourseButton = await findByText('Create New Course', { exact: false });
          fireEvent.click(createCourseButton);
          await findByText(/required field/);
          const existingAreaRadioButton = getByLabelText('Select an existing area', { exact: false }) as HTMLInputElement;
          const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
          const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
          const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
          const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
          fireEvent.click(existingAreaRadioButton);
          fireEvent.change(existingAreaSelect, { target: { value: `${physicsCourse.area.name}` } });
          fireEvent.change(courseTitleInput, { target: { value: `${physicsCourse.title}` } });
          fireEvent.change(isSEASSelect, { target: { value: `${physicsCourse.isSEAS}` } });
          fireEvent.change(termPatternSelect, { target: { value: `${physicsCourse.termPattern}` } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => !queryByText(/required field/));
          // Check that the existing area that was selected while creating a course was not added again to the area dropdown
          fireEvent.click(createCourseButton);
          await findByText(/required field/);
          const existingAreas = Array.from(existingAreaSelect.options);
          let selectedAreaCount = 0;
          existingAreas.forEach((area) => {
            if (area.value === physicsCourse.area.name) {
              selectedAreaCount += 1;
            }
          });
          strictEqual(selectedAreaCount, 1);
        });
      });
    });
    context('when editing a course', function () {
      beforeEach(function () {
        putStub = stub(request, 'put');
      });
      context('when a new area is added', function () {
        it('renders the newly added area to its existing area dropdown', async function () {
          putStub.resolves({ data: physicsCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          const NewAreaExample = () => {
            // Define metadata to be linked to the state
            // so that changes cause the components to rerender.
            // (The default render function, customRender,
            // does not use a rerendering metadata update.)
            const [currentMetadata, setMetadata] = useState(metadata);
            const metadataContext = new MetadataContextValue(
              currentMetadata,
              setMetadata
            );
            return (
              <MetadataContext.Provider value={metadataContext}>
                <CourseAdmin />
              </MetadataContext.Provider>
            );
          };
          ({
            findByText,
            queryByText,
            getByLabelText,
            getByText,
          } = render(
            <NewAreaExample />
          ));
          // Show the create course modal
          const editCourseButton = await waitForElement(
            () => document.getElementById('editCourse' + physicsCourseResponse.id)
          );
          fireEvent.click(editCourseButton);
          await findByText(/required field/);
          // Fill in the required fields and create a new area
          const newArea = 'ZZ';
          const newAreaRadioButton = getByLabelText('Create a new area', { exact: false }) as HTMLInputElement;
          const newAreaInput = document.getElementById('newArea') as HTMLInputElement;
          fireEvent.click(newAreaRadioButton);
          fireEvent.change(newAreaInput, { target: { value: newArea } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => !queryByText(/required field/));
          // Check that the new area that was created appears in the course admin existing areas dropdown
          fireEvent.click(editCourseButton);
          await findByText(/required field/);
          const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
          const existingAreas = Array.from(existingAreaSelect.options);
          const isNewAreaIncluded = existingAreas
            .some((area) => area.text === newArea);
          strictEqual(isNewAreaIncluded, true);
        });
      });
      context('when an existing area is selected', function () {
        it('does not re-add the existing area to the area dropdown', async function () {
          putStub.resolves({ data: computerScienceCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          const ExistingAreaExample = () => {
            // Define metadata to be linked to the state
            // so that changes cause the components to rerender.
            // (The default render function, customRender,
            // does not use a rerendering metadata update.)
            const [currentMetadata, setMetadata] = useState(metadata);
            const metadataContext = new MetadataContextValue(
              currentMetadata,
              setMetadata
            );
            return (
              <MetadataContext.Provider value={metadataContext}>
                <CourseAdmin />
              </MetadataContext.Provider>
            );
          };
          ({
            findByText,
            queryByText,
            getByLabelText,
            getByText,
          } = render(
            <ExistingAreaExample />
          ));
          // Show the create course modal
          const editCourseButton = await waitForElement(
            () => document.getElementById('editCourse' + physicsCourseResponse.id)
          );
          fireEvent.click(editCourseButton);
          await findByText(/required field/);
          const existingAreaRadioButton = getByLabelText('Select an existing area', { exact: false }) as HTMLInputElement;
          const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
          fireEvent.click(existingAreaRadioButton);
          fireEvent.change(existingAreaSelect, { target: { value: `${cs50Course.area.name}` } });
          const submitButton = getByText('Submit');
          fireEvent.click(submitButton);
          await wait(() => !queryByText(/required field/));
          const existingAreas = Array.from(existingAreaSelect.options);
          let selectedAreaCount = 0;
          existingAreas.forEach((area) => {
            if (area.value === cs50Course.area.name) {
              selectedAreaCount += 1;
            }
          });
          strictEqual(selectedAreaCount, 1);
        });
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
              courses={[]}
            />
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
          const errorMessage = 'Title should not be empty';
          putStub = stub(request, 'put');
          putStub.rejects(new Error(errorMessage));
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
              courses={[]}
            />
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
      beforeEach(function () {
        postStub = stub(request, 'post');
      });
      context('when required form fields are provided', function () {
        beforeEach(function () {
          postStub.resolves({ data: physicsCourseResponse });
          onSuccessStub = stub();
          onCloseStub = stub();
          ({ getByLabelText, getByText } = render(
            <CourseModal
              isVisible
              onSuccess={onSuccessStub}
              onClose={onCloseStub}
              courses={[]}
            />
          ));
          const existingAreaSelect = getByLabelText('Existing Area', { exact: true }) as HTMLSelectElement;
          fireEvent.change(
            existingAreaSelect,
            { target: { value: physicsCourseResponse.area.name } }
          );
          const catalogPrefixInput = getByLabelText('Catalog Prefix', { exact: false }) as HTMLInputElement;
          fireEvent.change(
            catalogPrefixInput,
            { target: { value: physicsCourseResponse.prefix } }
          );
          const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
          fireEvent.change(
            courseNumberInput,
            { target: { value: physicsCourseResponse.number } }
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
          const errorMessage = 'Title should not be empty';
          postStub.rejects(new Error(errorMessage));
          onSuccessStub = stub();
          onCloseStub = stub();
          ({ getByText } = render(
            <CourseModal
              isVisible
              onSuccess={onSuccessStub}
              onClose={onCloseStub}
              courses={[]}
            />
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
