import React from 'react';
import { strictEqual } from 'assert';
import {
  waitForElement,
  fireEvent,
  render,
} from '@testing-library/react';
import { render as customRender } from 'test-utils';
import { stub, SinonStub } from 'sinon';
import { MetadataAPI } from 'client/api/metadata';
import * as dummy from 'testData';
import { UserAPI } from 'client/api';
import { MemoryRouter } from 'react-router-dom';
import { ColdApp as App } from '../App';

describe('App', function () {
  let userStub: SinonStub;
  let metaStub: SinonStub;
  let dispatchMessage: SinonStub;
  beforeEach(function () {
    userStub = stub(UserAPI, 'getCurrentUser');
    metaStub = stub(MetadataAPI, 'getMetadata');
    dispatchMessage = stub();
    userStub.resolves(dummy.regularUser);
    metaStub.resolves(dummy.metadata);
  });
  describe('rendering', function () {
    it('creates a div for app content', async function () {
      const { container } = customRender(
        <App />,
        dispatchMessage
      );
      return waitForElement(() => container.querySelector('.app-content'));
    });
    /*
     * THESE TESTS ARE BROKEN. THEY SHOULDN'T REFERNCE THE MARKONETHEME
     * VALUE DIRECTLY AND SHOULD BE REWRITTEN
     *
    it('initially loads the Courses tab with visible top, left, right borders and a transparent bottom border', async function () {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );
      await waitForElement(() => getByText('Courses'));
      const tab = getByText('Courses').parentNode as HTMLElement;
      const style = window.getComputedStyle(tab);
      const actual = [
        style['border-bottom'],
        style['border-top'],
        style['border-left'],
        style['border-right'],
      ];
      const expected = [
        '1px solid transparent',
        `${MarkOneTheme.border.hairline}`,
        `${MarkOneTheme.border.hairline}`,
        `${MarkOneTheme.border.hairline}`,
      ];
      deepStrictEqual(actual, expected);
    });
    it('displays corresponding tab with visible top, left, right borders and transparent bottom border when navigating directly to that section', async function () {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/course-admin']}>
          <App />
        </MemoryRouter>
      );
      await waitForElement(() => getByText('Courses'));
      const link = getByText('Course Admin');
      const tab = link.parentNode as HTMLElement;
      const style = window.getComputedStyle(tab);
      const actual = [
        style['border-bottom'],
        style['border-top'],
        style['border-left'],
        style['border-right'],
      ];
      const expected = [
        '1px solid transparent',
        `${MarkOneTheme.border.hairline}`,
        `${MarkOneTheme.border.hairline}`,
        `${MarkOneTheme.border.hairline}`,
      ];
      deepStrictEqual(actual, expected);
    });
    it('displays tab with visible top, left, right borders and transparent bottom border when clicked', async function () {
      const { getByText } = render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
      await waitForElement(() => getByText('Courses'));
      const link = getByText('Non class meetings');
      fireEvent.click(link);
      const tab = link.parentNode as HTMLElement;
      const style = window.getComputedStyle(tab);
      const actual = [
        style['border-bottom'],
        style['border-top'],
        style['border-left'],
        style['border-right'],
      ];
      const expected = [
        '1px solid transparent',
        `${MarkOneTheme.border.hairline}`,
        `${MarkOneTheme.border.hairline}`,
        `${MarkOneTheme.border.hairline}`,
      ];
      deepStrictEqual(actual, expected);
    });
    it('displays the correct active tab with visible top, left, right borders and transparent bottom border when clicking the back button', async function () {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/course-admin', '/']}>
          <App />
        </MemoryRouter>
      );
      await waitForElement(() => getByText('Courses'));
      window.history.back();
      await waitForElement(() => getByText('Course Admin'));
      const tab = getByText('Course Admin').parentNode as HTMLElement;
      const style = window.getComputedStyle(tab);
      const actual = [
        style['border-bottom'],
        style['border-top'],
        style['border-left'],
        style['border-right'],
      ];
      const expected = [
        '1px solid transparent',
        `${MarkOneTheme.border.hairline}`,
        `${MarkOneTheme.border.hairline}`,
        `${MarkOneTheme.border.hairline}`,
      ];
      deepStrictEqual(actual, expected);
    });
    */
    it('only renders one active tab at a time', async function () {
      const { getAllByRole, findByText } = customRender(
        <App />,
        dispatchMessage
      );
      await findByText('Courses');
      const tabs = getAllByRole('listitem').map((listItem) => listItem.getElementsByTagName('div')[0]);
      const activeTabs = tabs.filter((tabItem) => window.getComputedStyle(tabItem)['border-bottom'] === '1px solid transparent');
      strictEqual(activeTabs.length, 1);
    });
    context('When userFetch succeeds', function () {
      beforeEach(function () {
        userStub.resolves(dummy.regularUser);
        metaStub.resolves(dummy.metadata);
      });
      it('displays the name of the current user', async function () {
        const { findByText } = customRender(
          <App />,
          dispatchMessage
        );
        strictEqual(userStub.callCount, 1);
        const { fullName } = dummy.regularUser;
        await findByText(new RegExp(fullName));
      });
    });
    context('When userFetch fails', function () {
      beforeEach(function () {
        userStub.rejects(dummy.error);
        metaStub.resolves(dummy.metadata);
      });
      it('displays an error Message', async function () {
        const { findByText } = customRender(
          <App />,
          dispatchMessage
        );
        strictEqual(userStub.callCount, 1);
        return findByText('Unable to get user data', { exact: false });
      });
    });
    context('When getMetadata fails', function () {
      beforeEach(function () {
        userStub.resolves(dummy.regularUser);
        metaStub.rejects(dummy.error);
      });
      it('displays an error Message', async function () {
        const { findByText } = customRender(
          <App />,
          dispatchMessage
        );
        strictEqual(userStub.callCount, 1);
        const nextButton = await findByText('next', { exact: false });
        fireEvent.click(nextButton);
        return findByText('Unable to get metadata', { exact: false });
      });
    });
  });
  describe('routing', function () {
    it('renders the NoMatch component when URL does not match any pages', function () {
      const url = '/foobar';
      const { getByText } = render(
        <MemoryRouter initialEntries={[url]}>
          <App />
        </MemoryRouter>
      );
      return waitForElement(() => (
        getByText('404', { exact: false })
      ));
    });
    it('renders the CourseAdmin component when URL matches the course admin URL', function () {
      const url = '/course-admin';
      const { getByText } = render(
        <MemoryRouter initialEntries={[url]}>
          <App />
        </MemoryRouter>
      );
      return waitForElement(() => (
        getByText('Course Prefix')
      ));
    });
    it('renders the FacultyAdmin component when URL matches the faculty admin URL', function () {
      const url = '/faculty-admin';
      const { getByText } = render(
        <MemoryRouter initialEntries={[url]}>
          <App />
        </MemoryRouter>
      );
      return waitForElement(() => (
        getByText('HUID')
      ));
    });
    it('renders the Faculty component when URL matches the faculty URL', function () {
      const url = '/faculty';
      const { getAllByText } = render(
        <MemoryRouter initialEntries={[url]}>
          <App />
        </MemoryRouter>
      );
      return waitForElement(() => (
        getAllByText('Sabbatical Leave')
      ));
    });
  });
});
