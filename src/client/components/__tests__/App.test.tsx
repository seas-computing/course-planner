import React from 'react';
import { strictEqual } from 'assert';
import { render, waitForElement } from '@testing-library/react';
import { stub, SinonStub } from 'sinon';
import { AxiosResponse } from 'axios';
import { UserResponse } from 'common/dto/users/userResponse.dto';
import * as dummy from 'testData';
import * as api from 'client/api';
import { App } from '../App';

describe('App', function () {
  let apiStub: SinonStub;
  beforeEach(function () {
    apiStub = stub(api, 'getCurrentUser');
    apiStub.resolves({
      data: dummy.regularUser,
    } as AxiosResponse<UserResponse>);
  });
  afterEach(function () {
    apiStub.restore();
  });
  describe('rendering', function () {
    it('creates a div for app content', async function () {
      const { container } = render(<App />);
      return waitForElement(() => container.querySelector('.app-content'));
    });
    context('When userFetch succeeds', function () {
      beforeEach(function () {
        apiStub.resolves({
          data: dummy.regularUser,
        } as AxiosResponse<UserResponse>);
      });
      it('displays the name of the current user', async function () {
        const { getByText } = render(<App />);
        strictEqual(apiStub.callCount, 1);
        const { fullName } = dummy.regularUser;
        return waitForElement(() => getByText(fullName, { exact: false }));
      });
    });
    context('When userFetch fails', function () {
      beforeEach(function () {
        apiStub.rejects(dummy.error);
      });
      it('displays an error Message', async function () {
        const { getByText } = render(<App />);
        strictEqual(apiStub.callCount, 1);
        return waitForElement(() => (
          getByText('Unable to get user data', { exact: false })
        ));
      });
    });
  });
  describe('routing', function () {
    it('renders the NoMatch component when URL path is not defined', function () {
      const url = '/foobar';
      const { getByText } = render(<App />);
      return waitForElement(() => (
        getByText('404', { exact: false })
      ));
    });
  });
});
