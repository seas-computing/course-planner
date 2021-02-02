import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MarkOneWrapper } from 'mark-one';
import * as dummy from 'testData';
import {
  UserContext, MessageContext, MetadataContext, MetadataContextValue,
} from 'client/context';
import { User } from 'common/classes';
import AppRouter from '../AppRouter';

describe('App Router', function () {
  const Metadata = ({ user, path }) => {
    const [currentMetadata, setMetadata] = useState(dummy.metadata);
    const metadataContext = new MetadataContextValue(
      currentMetadata, setMetadata
    );
    return (
      <MemoryRouter initialEntries={[path]}>
        <MarkOneWrapper>
          <MessageContext.Provider value={() => {}}>
            <UserContext.Provider value={user}>
              <MetadataContext.Provider value={metadataContext}>
                <AppRouter />
              </MetadataContext.Provider>
            </UserContext.Provider>
          </MessageContext.Provider>
        </MarkOneWrapper>
      </MemoryRouter>
    );
  };
  const renderRoute = (user: User) => (path: string) => render(
    <Metadata
      user={user}
      path={path}
    />
  );

  context('When there is a user in context', function () {
    const renderWithUser = renderRoute(dummy.regularUser);
    context('/', function () {
      it('renders the courses component', async function () {
        const { findByText } = renderWithUser('/');
        return findByText(/Is SEAS?/);
      });
    });
    context('/course-admin', function () {
      it('renders the CourseAdmin component', async function () {
        const { findByText } = renderWithUser('/course-admin');
        return findByText(/Area/);
      });
    });
    context('/faculty-admin', function () {
      it('renders the FacultyAdmin component', async function () {
        const { findAllByText } = renderWithUser('/faculty-admin');
        return findAllByText(/HUID/);
      });
    });
    context('/faculty', function () {
      it('renders the Faculty component', async function () {
        const { findAllByText } = renderWithUser('/faculty');
        return findAllByText(/Sabbatical Leave/);
      });
    });
    context('/courses', function () {
      it('renders the Courses component', async function () {
        const { findByText } = renderWithUser('/courses');
        return findByText(/Is SEAS?/);
      });
    });
    context('/four-year-plan', function () {
      it('renders the MultiYearPlan component', async function () {
        const { findAllByText } = renderWithUser('/four-year-plan');
        return findAllByText(/Catalog Prefix|Catalog Number|Title/);
      });
    });
    context('Undefined routes', function () {
      it('renders the NoMatch component', async function () {
        const { findByText } = renderWithUser('/foobar');
        return findByText(/404/);
      });
    });
  });
  context('When there is no user in context', function () {
    const renderWithoutUser = renderRoute(null);
    context('/', function () {
      it('renders the LoadSpinner', async function () {
        const { findByText } = renderWithoutUser('/');
        return findByText(/Fetching User Data/);
      });
    });
    context('/course-admin', function () {
      it('renders the LoadSpinner', async function () {
        const { findByText } = renderWithoutUser('/course-admin');
        return findByText(/Fetching User Data/);
      });
    });
    context('/faculty-admin', function () {
      it('renders the LoadSpinner', async function () {
        const { findByText } = renderWithoutUser('/faculty-admin');
        return findByText(/Fetching User Data/);
      });
    });
    context('/faculty', function () {
      it('renders the LoadSpinner', async function () {
        const { findByText } = renderWithoutUser('/faculty');
        return findByText(/Fetching User Data/);
      });
    });
    context('/courses', function () {
      it('renders the LoadSpinner', async function () {
        const { findByText } = renderWithoutUser('/courses');
        return findByText(/Fetching User Data/);
      });
    });
    context('/four-year-plan', function () {
      it('renders the LoadSpinner', async function () {
        const { findByText } = renderWithoutUser('/four-year-plan');
        return findByText(/Fetching User Data/);
      });
    });
    context('Undefined routes', function () {
      it('renders the LoadSpinner', async function () {
        const { findByText } = renderWithoutUser('/foobar');
        return findByText(/Fetching User Data/);
      });
    });
  });
});
