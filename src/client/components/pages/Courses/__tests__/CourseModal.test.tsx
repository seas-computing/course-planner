import {
  strictEqual,
} from 'assert';
import {
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
import { metadata } from 'testData';
import { IS_SEAS } from 'common/constants';
import CourseModal from '../CourseModal';

describe('Course Modal', function () {
  context('When creating a new course', function () {
    let queryAllByRole: BoundFunction<AllByRole>;
    let getByLabelText: BoundFunction<GetByText>;
    const dispatchMessage: SinonStub = stub();
    describe('On Open Behavior', function () {
      beforeEach(function () {
        ({ getByLabelText, queryAllByRole } = render(
          <CourseModal isVisible />,
          dispatchMessage,
          metadata
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
  });
});
