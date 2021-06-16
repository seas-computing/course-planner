import React from 'react';
import {
  BoundFunction,
  GetByText,
} from '@testing-library/react';
import { render } from 'test-utils';
import { VerticalSpace } from '..';

describe('VerticalSpace Component', function () {
  let getByText: BoundFunction<GetByText>;
  const testText = 'Vertical Space Text';
  beforeEach(function () {
    ({ getByText } = render(
      <VerticalSpace>
        {testText}
      </VerticalSpace>
    ));
  });
  it('renders', function () {
    getByText(testText);
  });
});
