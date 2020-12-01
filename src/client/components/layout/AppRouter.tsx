import React, { FunctionComponent, ReactElement, useContext } from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { LoadSpinner } from 'mark-one';
import {
  NoMatch,
  CourseAdmin,
  FacultyAdmin,
  Faculty,
  Courses,
  MultiYearPlan,
  Schedule,
} from '../pages';
import { UserContext } from '../../context';

const AppRouter: FunctionComponent = (): ReactElement => {
  const currentUser = useContext(UserContext);
  if (currentUser) {
    return (
      <Switch>
        <Redirect exact from="/" to="/courses" />
        <Route exact path="/courses" component={Courses} />
        <Route exact path="/course-admin" component={CourseAdmin} />
        <Route exact path="/faculty" component={Faculty} />
        <Route exact path="/faculty-admin" component={FacultyAdmin} />
        <Route exact path="/four-year-plan" component={MultiYearPlan} />
        <Route exact path="/schedule" component={Schedule} />
        <Route component={NoMatch} />
      </Switch>
    );
  }
  return (
    <LoadSpinner>
      Fetching User Data
    </LoadSpinner>
  );
};

export default AppRouter;
