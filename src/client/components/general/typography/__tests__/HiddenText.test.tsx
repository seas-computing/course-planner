import React from 'react';
import { render } from 'common/utils';
import { strictEqual } from 'assert';
import { HiddenText } from '..';

describe('HiddenText', function () {
  it('Does not render the text on the screen', function () {
    const { getByText } = render(
      <HiddenText>Hidden</HiddenText>,
      () => {}
    );
    const hiddenStyle = window.getComputedStyle(getByText('Hidden'));
    strictEqual(hiddenStyle.display, 'none');
  });
  it('Keeps the full text hidden in the DOM content', function () {
    const { container } = render(
      <HiddenText>Hidden</HiddenText>,
      () => {}
    );
    strictEqual(container.textContent, 'Hidden');
  });
});
