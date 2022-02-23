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
    isAdmin,
    isReadOnly,
  } = useGroupGuard();

  return (
    <Switch>
      <Redirect
        exact
        from="/"
        to={isReadOnly ? '/courses' : '/four-year-plan'}
      />
      {isReadOnly
          && <Route exact path="/non-class-meetings" component={NonClassMeetings} />}
      {isReadOnly
          && <Route exact path="/courses" component={Courses} />}
      {isReadOnly
          && <Route exact path="/faculty" component={Faculty} />}
      <Route exact path="/four-year-plan" component={MultiYearPlan} />
      <Route exact path="/schedule" component={Schedule} />
      {isAdmin
        && <Route exact path="/course-admin" component={CourseAdmin} />}
      {isAdmin
        && <Route exact path="/faculty-admin" component={FacultyAdmin} />}
      <Route component={NoMatch} />
    </Switch>
  );
};

export default AppRouter;
