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
  RoomSchedule,
} from '../pages';
import { useGroupGuard } from '../../hooks/useGroupGuard';
import ForbiddenPage from '../pages/ForbiddenPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import RoomAdmin from '../pages/RoomAdmin/RoomAdmin';

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

  const publicHostname = new URL(process.env.PUBLIC_CLIENT_URL).hostname;

  /**
   * Render the routes for the public app, with 401 errors for pages that
   * require authorization and 404 for all other routes
   */
  if (window.location.hostname === publicHostname) {
    return (
      <Switch>
        <Redirect exact from="/" to="/four-year-plan" />
        <Route exact path="/four-year-plan" component={MultiYearPlan} />
        <Route exact path="/schedule" component={Schedule} />
        <Route exact path="/room-schedule" component={RoomSchedule} />
        <Route
          exact
          path={[
            '/non-class-meetings',
            '/courses',
            '/faculty',
            '/course-admin',
            '/faculty-admin',
            '/room-admin',
          ]}
          component={UnauthorizedPage}
        />
        <Route component={NoMatch} />
      </Switch>
    );
  }

  /**
   * Render the routes for the private app, with 403 errors for pages that
   * require higher permission levels and 404 for all other routes
   */
  if (isLoggedIn) {
    return (
      <Switch>
        <Redirect exact from="/" to="/courses" />
        <Route
          exact
          path="/non-class-meetings"
          component={isReadOnly ? NonClassMeetings : ForbiddenPage}
        />
        <Route
          exact
          path="/courses"
          component={isReadOnly ? Courses : ForbiddenPage}
        />
        <Route
          exact
          path="/faculty"
          component={isReadOnly ? Faculty : ForbiddenPage}
        />
        <Route exact path="/four-year-plan" component={MultiYearPlan} />
        <Route exact path="/schedule" component={Schedule} />
        <Route exact path="/room-schedule" component={RoomSchedule} />
        <Route
          exact
          path="/course-admin"
          component={isAdmin ? CourseAdmin : ForbiddenPage}
        />
        <Route
          exact
          path="/faculty-admin"
          component={isAdmin ? FacultyAdmin : ForbiddenPage}
        />
        <Route
          exact
          path="/room-admin"
          component={isAdmin ? RoomAdmin : ForbiddenPage}
        />
        <Route component={NoMatch} />
      </Switch>
    );
  }

  /**
   * A fallthrough router, equivalent to not being logged in on the private
   * app. Renders 401 errors for all "real" routes, or 404 for everything else.
   */
  return (
    <Switch>
      <Route
        exact
        path={[
          '/',
          '/non-class-meetings',
          '/courses',
          '/faculty',
          '/four-year-plan',
          '/schedule',
          '/room-schedule',
          '/course-admin',
          '/faculty-admin',
          '/room-admin',
        ]}
        component={UnauthorizedPage}
      />
      <Route component={NoMatch} />
    </Switch>
  );
};

export default AppRouter;
