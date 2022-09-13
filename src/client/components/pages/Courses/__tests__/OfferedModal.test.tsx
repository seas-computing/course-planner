import {
  AllByRole,
  BoundFunction,
  fireEvent,
  GetByText,
  QueryByText,
  wait,
  waitForElement,
  waitForElementToBeRemoved,
  RenderResult,
} from '@testing-library/react';
import { render } from 'test-utils';
import React from 'react';
import {
  strictEqual, deepStrictEqual,
} from 'assert';
import * as dummy from 'testData';
import * as courseAPI from 'client/api/courses';
import { SinonStub, stub } from 'sinon';
import { TERM } from 'common/constants';
import { TermKey } from 'common/constants/term';
import { cs50CourseInstance, cs50FallInstanceUpdate } from 'testData';
import axios from 'axios';
import OfferedModal from '../OfferedModal';

describe('Offered Modal', function () {
  let renderResult: RenderResult;
  let getByText: BoundFunction<GetByText>;
  let getByLabelText: BoundFunction<GetByText>;
  let queryAllByRole: BoundFunction<AllByRole>;
  let queryByText: BoundFunction<QueryByText>;
  let onCloseStub: SinonStub;
  let onSaveStub: SinonStub;
  let putStub: SinonStub;
  const meetingTerm = TERM.SPRING;
  const semKey = meetingTerm.toLowerCase() as TermKey;
  const testCourseInstance = cs50CourseInstance;
  describe('rendering', function () {
    beforeEach(function () {
      onCloseStub = stub();
      onSaveStub = stub();
      renderResult = render(
        <OfferedModal
          isVisible
          currentCourseInstance={testCourseInstance}
          currentSemester={{
            academicYear: testCourseInstance[semKey].calendarYear,
            term: meetingTerm,
          }}
          onClose={onCloseStub}
          onSave={onSaveStub}
        />
      );
      ({
        getByText,
        getByLabelText,
        queryAllByRole,
        queryByText,
      } = renderResult);
    });
    describe('On Open Behavior', function () {
      it('populates the heading with the correct course instance information', function () {
        return waitForElement(
          () => getByText(`Edit Offered Value for ${cs50CourseInstance.catalogNumber}, ${meetingTerm} ${cs50CourseInstance[semKey].calendarYear}`)
        );
      });
      it('populates the offered dropdown with the expected current instance offered value', function () {
        const offeredSelect = getByLabelText('Edit Offered Value', { exact: false }) as HTMLSelectElement;
        strictEqual(offeredSelect.value, cs50CourseInstance[semKey].offered);
      });
    });
    describe('On Submit Behavior', function () {
      let saveButton: HTMLElement;
      beforeEach(function () {
        putStub = stub(courseAPI, 'updateCourseInstance');
        saveButton = getByText('Save');
      });
      context('When the save operation succeeds', function () {
        beforeEach(async function () {
          putStub.resolves(cs50FallInstanceUpdate);
          fireEvent.click(saveButton);
          await waitForElementToBeRemoved(
            () => getByText('Saving')
          );
        });
        it('Should not display an error message', function () {
          const errorMessage = queryAllByRole('alert');
          strictEqual(errorMessage.length, 0);
        });
        it('Should call the onSave handler', function () {
          strictEqual(onSaveStub.callCount, 1);
          deepStrictEqual(onSaveStub.args[0][0], cs50FallInstanceUpdate);
        });
      });
      context('When the save operation fails', function () {
        context('With a server Error', function () {
          beforeEach(async function () {
            stub(axios, 'isAxiosError').returns(true);
            putStub.rejects({ response: { data: dummy.error } });
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(
              () => getByText('Saving')
            );
          });
          it('Displays the error message from the server', async function () {
            const errorMessage = await renderResult.findAllByRole('alert');
            strictEqual(errorMessage.length, 1);
            strictEqual(errorMessage[0].textContent, dummy.error.message);
          });
        });
        context('With any other error', function () {
          beforeEach(async function () {
            stub(axios, 'isAxiosError').returns(false);
            putStub.rejects(dummy.error);
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(
              () => getByText('Saving')
            );
          });
          it('Prefixes the error with a message to try again', async function () {
            const errorMessage = await renderResult.findAllByRole('alert');
            strictEqual(errorMessage.length, 1);
            const errorText = errorMessage[0].textContent;
            strictEqual(errorText.includes(dummy.error.message), true);
            strictEqual(errorText.includes('try again'), true);
          });
        });
      });
    });
    describe('On Close Behavior', function () {
      it('calls the onClose handler once', async function () {
        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);
        await wait(() => !queryByText(/Edit Offered Value for/));
        await wait(() => strictEqual(onCloseStub.callCount, 1));
      });
    });
  });
});
