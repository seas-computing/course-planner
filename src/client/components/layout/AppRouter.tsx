import React, { FunctionComponent, ReactElement } from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import {
  NoMatch,
  CourseAdmin,
  FacultyAdmin,
  Faculty,
  Courses,
  MultiYearPlan,
  Schedule,
  NonClassMeetings,
} from '../pages';
import { useGroupGuard } from '../../hooks/useGroupGuard';
import ForbiddenPage from '../pages/ForbiddenPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

/**
 * Selects which body component to render based on the current URL path. The
 * options will dynamically change based on the permissions of the logged-in
 * users (or not logged in, for the info.seas view)
 */

const AppRouter: FunctionComponent = (): ReactElement => {
  /**
   * Check the user's permission to determine which pages should be available
   */
  const {
    isLoggedIn,
    isAdmin,
    isReadOnly,
  } = useGroupGuard();

  if (isLoggedIn) {
    return (
      <Switch>
        <Redirect
          exact
          from="/"
          to={isReadOnly ? '/courses' : '/four-year-plan'}
        />
        <Route
          exact
          path="/non-class-meetings"
          component={isReadOnly
            ? NonClassMeetings
            : ForbiddenPage}
        />
        <Route
          exact
          path="/courses"
          component={
            isReadOnly
              ? Courses
              : ForbiddenPage
          }
        />
        <Route
          exact
          path="/faculty"
          component={
            isReadOnly
              ? Faculty
              : ForbiddenPage
          }
        />
        <Route exact path="/four-year-plan" component={MultiYearPlan} />
        <Route exact path="/schedule" component={Schedule} />
        <Route
          exact
          path="/course-admin"
          component={
            isAdmin
              ? CourseAdmin : ForbiddenPage
          }
        />
        <Route
          exact
          path="/faculty-admin"
          component={
            isAdmin ? FacultyAdmin : ForbiddenPage
          }
        />
        <Route component={NoMatch} />
      </Switch>
    );
  }
  return (<UnauthorizedPage />);
};

export default AppRouter;
