import React, { useEffect, useState } from 'react';
import {
  strictEqual,
} from 'assert';
import {
  waitForElement,
  wait,
  fireEvent,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import {
  physicsCourseResponse,
  computerScienceCourseResponse,
  physicsCourse,
  metadata,
  newAreaCourseResponse,
} from 'testData';
import { CourseAPI } from 'client/api/courses';
import { render } from 'test-utils';
import CourseAdmin from 'client/components/pages/CourseAdmin';
import { MetadataContext, MetadataContextValue } from 'client/context/MetadataContext';

describe('Course Admin Modal Behavior', function () {
  let getStub: SinonStub;
  let postStub: SinonStub;
  let putStub: SinonStub;
  let dispatchMessage: SinonStub;
  const testData = [
    physicsCourseResponse,
    computerScienceCourseResponse,
  ];
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getAllCourses');
    getStub.resolves(testData);
    postStub = stub(CourseAPI, 'createCourse');
    postStub.resolves(newAreaCourseResponse);
    putStub = stub(CourseAPI, 'editCourse');
    putStub.resolves(newAreaCourseResponse);
    dispatchMessage = stub();
  });
  describe('rendering', function () {
    context('when the create course button is clicked and the modal is up', function () {
      context('when the modal is closed', function () {
        it('returns focus to the create course button', async function () {
          const { findByText, queryByText } = render(
            <CourseAdmin />,
            dispatchMessage
          );
          // Show the create course modal
          const createCourseButton = await findByText('Create New Course', { exact: false });
          fireEvent.click(createCourseButton);
          await findByText(/required field/);
          const cancelButton = await findByText(/Cancel/);
          // Close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText(/required field/));
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
          const { findByText, queryByText } = render(
            <CourseAdmin />,
            dispatchMessage
          );
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
    context('when a new area is added while creating a course', function () {
      it('renders the newly added area to its existing area dropdown', async function () {
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
        const {
          findByText,
          queryByText,
          getByLabelText,
          getByText,
        } = render(
          <NewAreaExample />,
          dispatchMessage
        );
        // Show the create course modal
        const createCourseButton = await findByText('Create New Course', { exact: false });
        fireEvent.click(createCourseButton);
        await findByText(/required field/);
        // Fill in the required fields and create a new area
        const newArea = 'NA';
        const newAreaRadioButton = getByLabelText('Create a new area', { exact: false }) as HTMLInputElement;
        const newAreaInput = document.getElementById('newArea') as HTMLInputElement;
        const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
        const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
        const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
        const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
        fireEvent.click(newAreaRadioButton);
        fireEvent.change(newAreaInput, { target: { value: newArea } });
        fireEvent.change(courseNumberInput, { target: { value: `${physicsCourse.prefix} ${physicsCourse.number}` } });
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
    context('when a new area is added by editing a course', function () {
      it('renders the newly added area to its existing area dropdown', async function () {
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
        const {
          findByText,
          queryByText,
          getByLabelText,
          getByText,
        } = render(
          <NewAreaExample />,
          dispatchMessage
        );
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
  });
});
