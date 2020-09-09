import React from 'react';
import {
  BoundFunction,
  GetByText,
} from '@testing-library/react';
import {
  render,
} from 'test-utils';
import { strictEqual } from 'assert';
import { VerticalSpace } from '..';

describe.only('VerticalSpace Component', function () {
  let getByText: BoundFunction<GetByText>;
  let testText = 'Vertical Space Text';
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
  it('sets the margin to the correct value', function () {
    const element = getByText(testText) as HTMLDivElement;
    const style = window.getComputedStyle(element);
    console.log(element.nodeType, element.innerHTML);
    console.log(style);
    // strictEqual(style.margin, '5px');
  });
});
