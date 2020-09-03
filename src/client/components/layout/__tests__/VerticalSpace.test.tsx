import React from 'react';
import {
  BoundFunction,
  GetByBoundAttribute,
} from '@testing-library/react';
import {
  render,
} from 'test-utils';
import { strictEqual } from 'assert';
import { VerticalSpace } from '../VerticalSpace';

describe('VerticalSpace Component', function () {
  let getByTestId: BoundFunction<GetByBoundAttribute>;
  context('when the height is not specified', function () {
    beforeEach(function () {
      ({ getByTestId } = render(
        <VerticalSpace testId="test-component" />,
        () => {}
      ));
    });
    it('creates a div', function () {
      getByTestId('test-component');
    });
    it('sets the height to the default value', function () {
      const style = window.getComputedStyle(getByTestId('test-component') as HTMLDivElement);
      strictEqual(style.height, '5px');
    });
  });
  context('when the height is specified', function () {
    const customHeight = '20px';
    beforeEach(function () {
      ({ getByTestId } = render(
        <VerticalSpace
          testId="test-specified-height"
          height={customHeight}
        />,
        () => {}
      ));
    });
    it('creates a div', function () {
      getByTestId('test-specified-height');
    });
    it('the height is set accordingly', function () {
      const style = window.getComputedStyle(getByTestId('test-specified-height') as HTMLDivElement);
      strictEqual(style.height, customHeight);
    });
  });
});
