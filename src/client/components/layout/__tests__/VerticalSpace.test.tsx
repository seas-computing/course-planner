import React from 'react';
import {
  BoundFunction,
  GetByBoundAttribute,
} from '@testing-library/react';
import {
  render,
} from 'test-utils';
import { VerticalSpace } from '../VerticalSpace';

describe('VerticalSpace Component', function () {
  let getByTestId: BoundFunction<GetByBoundAttribute>;
  beforeEach(function () {
    ({ getByTestId } = render(
      <VerticalSpace data-testid="test-component" />,
      () => {}
    ));
  });
  it('creates a div', function () {
    getByTestId('test-component');
  });
});
