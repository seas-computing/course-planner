import React from 'react';
import {
  render, BoundFunction, QueryByText,
} from 'test-utils';
import { stub, SinonStub } from 'sinon';
import assert from 'assert';
import * as dummy from 'testData';
import AppHeader from '../AppHeader';

describe('AppHeader', function () {
  let contextStub: SinonStub;
  beforeEach(function () {
    contextStub = stub(React, 'useContext');
    contextStub.callThrough();
  });
  context('When user is logged in', function () {
  // TODO: Setting up the test for the full permission view. Needs to be
  // duplicated/modified for other views when implemented
    context('When user is an admin', function () {
      let queryByText: BoundFunction<QueryByText>;
      beforeEach(function () {
        ({ queryByText } = render(
          <AppHeader currentUser={dummy.adminUser} />,
          () => {}
        ));
      });
      it('should display the "Schedule" link', function () {
        const link = queryByText('Schedule');
        assert(link);
      });
      it('should display the "4 Year Plan" link', function () {
        const link = queryByText('4 Year Plan');
        assert(link);
      });
      it('should display the "Courses" link', function () {
        const link = queryByText('Courses');
        assert(link);
      });
      it('should display the "Non class meetings" link', function () {
        const link = queryByText('Non class meetings');
        assert(link);
      });
      it('should display the "Faculty" link', function () {
        const link = queryByText('Faculty');
        assert(link);
      });
      it('should display the "Course Admin" link', function () {
        const link = queryByText('Course Admin');
        assert(link);
      });
      it('should display the "Faculty Admin" link', function () {
        const link = queryByText('Faculty Admin');
        assert(link);
      });
      it('Should display a log out link', function () {
        const link = queryByText('Log Out');
        assert(link);
      });
    });
  });
  context('When user is not logged in', function () {
    let queryByText: BoundFunction<QueryByText>;
    beforeEach(function () {
      ({ queryByText } = render(
        <AppHeader currentUser={null} />,
        () => {}
      ));
    });
    it('Should not display a log out link', function () {
      const link = queryByText('Log Out');
      assert(!link);
    });
  });
});
