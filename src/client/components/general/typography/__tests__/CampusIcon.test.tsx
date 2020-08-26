import React from 'react';
import { render } from 'common/utils';
import { strictEqual } from 'assert';
import { CampusIcon } from '..';

describe('CampusIcon', function () {
  it('renders the first letter on screen', function () {
    const { getByText } = render(
      <CampusIcon>Allston</CampusIcon>,
      () => {}
    );
    const campusStyle = window.getComputedStyle(getByText('A'));
    strictEqual(campusStyle.visibility, 'visible');
  });
  it('Does not render the other characters', function () {
    const { getByText } = render(
      <CampusIcon>Allston</CampusIcon>,
      () => {}
    );
    const hiddenStyle = window.getComputedStyle(getByText('llston'));
    strictEqual(hiddenStyle.display, 'none');
  });
  it('Keeps the full text hidden in the DOM content', function () {
    const { container } = render(
      <CampusIcon>Allston</CampusIcon>,
      () => {}
    );
    strictEqual(container.textContent, 'Allston');
  });
});
