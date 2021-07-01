import React from 'react';
import { render } from 'test-utils';
import { strictEqual } from 'assert';
import { HiddenText } from '..';

describe('HiddenText', function () {
  it('Keeps the full text hidden in the DOM content', function () {
    const { container } = render(
      <HiddenText>Hidden</HiddenText>
    );
    strictEqual(container.textContent, 'Hidden');
  });
});
