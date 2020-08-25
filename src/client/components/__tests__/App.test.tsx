import React from 'react';
import { strictEqual } from 'assert';
import {
  render,
  waitForElement,
  BoundFunction,
  FindByText,
  wait,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { stub, SinonStub } from 'sinon';
import * as dummy from 'testData';
import * as userApi from 'client/api/users';
import * as metaApi from 'client/api/metadata';
import { User } from 'common/classes';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import App from '../App';

describe('App', function () {
  let userFetchStub: SinonStub;
  let metaFetchStub: SinonStub;
  let setUserStateStub: SinonStub;
  let setMetaStateStub: SinonStub;
  let stateStub: SinonStub<(User | MetadataResponse | null)[]>;
  beforeEach(function () {
    userFetchStub = stub(userApi, 'getCurrentUser').resolves(dummy.regularUser);
    metaFetchStub = stub(metaApi, 'getMetadata').resolves(dummy.metadata);
    setUserStateStub = stub();
    setMetaStateStub = stub();
    stateStub = stub(React, 'useState');
    stateStub
      .withArgs(null)
      .returns(
        [
          null,
          setUserStateStub,
        ]
      );
    stateStub
      .withArgs(
        {
          currentAcademicYear: null,
          areas: [],
          semesters: [],
        }
      )
      .returns(
        [
          {
            currentAcademicYear: null,
            areas: [],
            semesters: [],
          },
          setMetaStateStub,
        ]
      );
    stateStub.callThrough();
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
  });
  describe('Getting user and Metadata', function () {
    context('When userFetch Succeeds', function () {
      context('With a valid user', function () {
        beforeEach(function () {
          userFetchStub.resolves(dummy.regularUser);
          metaFetchStub.resolves(dummy.metadata);
          render(
            <MemoryRouter>
              <App />
            </MemoryRouter>
          );
        });
        it('Calls getCurrentUser', function () {
          strictEqual(userFetchStub.callCount, 1);
        });
        it('Sets the user result in state', async function () {
          await wait(() => strictEqual(setUserStateStub.callCount, 1));
          strictEqual(setUserStateStub.args[0][0], dummy.regularUser);
        });
        it('calls getMetadata', async function () {
          return wait(() => strictEqual(metaFetchStub.callCount, 1));
        });
      });
      context('Without a user', function () {
        beforeEach(function () {
          userFetchStub.resolves(null);
          metaFetchStub.resolves(dummy.metadata);
          render(
            <MemoryRouter>
              <App />
            </MemoryRouter>
          );
        });
        it('Calls getCurrentUser', function () {
          strictEqual(userFetchStub.callCount, 1);
        });
        it('Does not set the user result in state', function () {
          strictEqual(setUserStateStub.callCount, 0);
        });
        it('Does not call getMetadata', function () {
          strictEqual(metaFetchStub.callCount, 0);
        });
      });
    });
    context('When userFetch fails', function () {
      let findByText: BoundFunction<FindByText>;
      beforeEach(function () {
        userFetchStub.rejects(dummy.error);
        metaFetchStub.resolves(dummy.metadata);
        ({ findByText } = render(
          <MemoryRouter>
            <App />
          </MemoryRouter>
        ));
      });
      it('displays an error Message', async function () {
        await findByText(/Unable to get user data/);
        strictEqual(userFetchStub.callCount, 1);
      });
      it('does not call getMetadata', async function () {
        await findByText(/Unable to get user data/);
        strictEqual(metaFetchStub.callCount, 0);
      });
    });
    context('When getMetadata succeeds', function () {
      beforeEach(function () {
        userFetchStub.resolves(dummy.regularUser);
        metaFetchStub.resolves(dummy.metadata);
        render(
          <MemoryRouter>
            <App />
          </MemoryRouter>
        );
      });
      it('calls getMetadata', async function () {
        return wait(() => strictEqual(metaFetchStub.callCount, 1));
      });
      it('Sets the metadata into state', async function () {
        await wait(() => strictEqual(metaFetchStub.callCount, 1));
        strictEqual(setMetaStateStub.callCount, 1);
        strictEqual(setMetaStateStub.args[0][0], dummy.metadata);
      });
    });

    context('When getMetadata fails', function () {
      let findByText: BoundFunction<FindByText>;
      beforeEach(function () {
        userFetchStub.resolves(dummy.regularUser);
        metaFetchStub.rejects(dummy.error);
        ({ findByText } = render(
          <MemoryRouter>
            <App />
          </MemoryRouter>
        ));
      });
      it('displays an error Message', async function () {
        strictEqual(userFetchStub.callCount, 1);
        return findByText(/Unable to get metadata/);
      });
    });
  });
});
