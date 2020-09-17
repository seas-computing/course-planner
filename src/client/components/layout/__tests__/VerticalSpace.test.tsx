import React from 'react';
import {
  BoundFunction,
  GetByText,
} from '@testing-library/react';
import {
  render,
} from 'common/utils';
import { VerticalSpace } from '..';

describe('VerticalSpace Component', function () {
  let getByText: BoundFunction<GetByText>;
  const testText = 'Vertical Space Text';
  beforeEach(function () {
    ({ getByText } = render(
      <VerticalSpace>
        {testText}
      </VerticalSpace>,
      () => {}
    ));
  });
  it('renders', function () {
    getByText(testText);
  });
});
