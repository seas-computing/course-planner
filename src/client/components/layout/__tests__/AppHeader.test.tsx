import React from 'react';
import {
  render, BoundFunction, QueryByText,
} from 'test-utils';
import { stub, SinonStub } from 'sinon';
import assert from 'assert';
import * as dummy from 'testData';
import AppHeader from '../AppHeader';
import { UserContext } from '../../../context';

describe('AppHeader', function () {
  let contextStub: SinonStub;
  beforeEach(function () {
    contextStub = stub(React, 'useContext');
    contextStub.callThrough();
  });
  // TODO: Setting up the test for the full permission view. Needs to be
  // duplicated/modified for other views when implemented
  context('When user is an admin', function () {
    let queryByText: BoundFunction<QueryByText>;
    beforeEach(function () {
      contextStub
        .withArgs(UserContext)
        .returns(dummy.adminUser);
      ({ queryByText } = render(<AppHeader />, () => {}));
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
  });
});
