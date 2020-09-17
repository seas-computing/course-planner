import React from 'react';
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
import { FacultyAPI } from 'client/api/faculty';
import {
  physicsFacultyMemberResponse,
  bioengineeringFacultyMemberResponse,
  newAreaFacultyMemberResponse,
} from 'common/data';
import { render } from 'test-utils';
import { metadata } from 'common/data/metadata';
import FacultyAdmin from 'client/components/pages/FacultyAdmin';

describe('Faculty Admin Modal Behavior', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  const testData = [
    physicsFacultyMemberResponse,
    bioengineeringFacultyMemberResponse,
    newAreaFacultyMemberResponse,
  ];
  beforeEach(function () {
    getStub = stub(FacultyAPI, 'getAllFacultyMembers');
    dispatchMessage = stub();
    getStub.resolves(testData);
  });
  describe('rendering', function () {
    context('when the create faculty button has been clicked and the modal is up', function () {
      context('when the modal is closed', function () {
        it('returns focus to the create faculty button', async function () {
          const { findByText, queryByText } = render(
            <FacultyAdmin />,
            dispatchMessage,
            metadata
          );
          // show the create faculty modal
          const createFacultyButton = await findByText('Create New Faculty', { exact: false });
          fireEvent.click(createFacultyButton);
          await findByText('required field', { exact: false });
          const cancelButton = await findByText('Cancel', { exact: false });
          // close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText('required field', { exact: false }));
          strictEqual(
            document.activeElement as HTMLElement,
            createFacultyButton
          );
        });
      });
    });
    context('when an edit faculty button has been clicked and the modal is up', function () {
      context('when the modal is closed', function () {
        it('returns focus to the original edit faculty button', async function () {
          const { findByText, queryByText } = render(
            <FacultyAdmin />,
            dispatchMessage,
            metadata
          );
          // show the edit faculty modal
          const editPhysicsFacultyButton = await waitForElement(() => document.getElementById('editFaculty' + physicsFacultyMemberResponse.id));
          fireEvent.click(editPhysicsFacultyButton);
          await findByText('required field', { exact: false });
          const cancelButton = await findByText('Cancel', { exact: false });
          // close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText('required field', { exact: false }));
          strictEqual(
            document.activeElement as HTMLElement,
            editPhysicsFacultyButton
          );
        });
      });
    });
  });
});
