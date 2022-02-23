import React, { FunctionComponent, ReactElement, useContext } from 'react';
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
import { MetadataContext, UserContext } from '../../context';

const AppRouter: FunctionComponent = (): ReactElement => {
  const currentUser = useContext(UserContext);
  const currentMetadata = useContext(MetadataContext);
  if (currentUser && currentMetadata?.currentAcademicYear) {
    return (
      <Switch>
        <Redirect exact from="/" to="/courses" />
        <Route exact path="/non-class-meetings" component={NonClassMeetings} />
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
  return null;
};

export default AppRouter;
