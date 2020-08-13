import React from 'react';
import { strictEqual } from 'assert';
import {
  render,
  waitForElement,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { stub, SinonStub } from 'sinon';
import * as dummy from 'testData';
import * as userApi from 'client/api/users';
import { ColdApp as App } from '../App';

describe('App', function () {
  let apiStub: SinonStub;
  beforeEach(function () {
    apiStub = stub(userApi, 'getCurrentUser');
    apiStub.resolves(dummy.regularUser);
  });
  describe('rendering', function () {
    it('creates a div for app content', async function () {
      const { container } = render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
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
      const { getAllByRole, findByText } = render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
      await findByText('Courses');
      const tabs = getAllByRole('listitem').map((listItem) => listItem.getElementsByTagName('div')[0]);
      const activeTabs = tabs.filter((tabItem) => window.getComputedStyle(tabItem)['border-bottom'] === '1px solid transparent');
      strictEqual(activeTabs.length, 1);
    });
    context('When userFetch succeeds', function () {
      beforeEach(function () {
        apiStub.resolves(dummy.regularUser);
      });
      it('displays the name of the current user', async function () {
        const { findByText } = render(
          <MemoryRouter>
            <App />
          </MemoryRouter>
        );
        strictEqual(apiStub.callCount, 1);
        const { fullName } = dummy.regularUser;
        return findByText(new RegExp(fullName));
      });
    });
    context('When userFetch fails', function () {
      beforeEach(function () {
        apiStub.rejects(dummy.error);
      });
      it('displays an error Message', async function () {
        const { getByText } = render(
          <MemoryRouter>
            <App />
          </MemoryRouter>
        );
        strictEqual(apiStub.callCount, 1);
        return waitForElement(() => (
          getByText('Unable to get user data', { exact: false })
        ));
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
