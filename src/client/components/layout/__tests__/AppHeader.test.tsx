import React from 'react';
import {
  render, BoundFunction, QueryByText,
} from 'test-utils';
import { stub, SinonStub } from 'sinon';
import assert, { strictEqual, notStrictEqual } from 'assert';
import * as dummy from 'testData';
import AppHeader from '../AppHeader';
import { User } from '../../../../common/classes';

describe('AppHeader', function () {
  let contextStub: SinonStub;
  beforeEach(function () {
    contextStub = stub(React, 'useContext');
    contextStub.callThrough();
  });
  context('When user is logged in', function () {
    it('Should display a log out button', function () {
      const { getByText } = render(
        <AppHeader />,
        {
          currentUser: dummy.adminUser,
        }
      );
      const logout = getByText('Log Out') as HTMLLinkElement;
      strictEqual(logout.href, `${process.env.SERVER_URL}/logout`);
    });
    it('Should not display a log in button', function () {
      const { queryByText } = render(
        <AppHeader />,
        {
          currentUser: dummy.adminUser,
        }
      );
      const login = queryByText('Log In') as HTMLLinkElement;
      strictEqual(login, null);
    });
    context('When user is an admin', function () {
      let queryByText: BoundFunction<QueryByText>;
      beforeEach(function () {
        ({ queryByText } = render(
          <AppHeader />,
          {
            currentUser: dummy.adminUser,
          }
        ));
      });
      it('should display the "Schedule" link', function () {
        const link = queryByText('Schedule');
        assert(link);
      });
      it('should display the "Room Schedule" link', function () {
        const link = queryByText('Room Schedule');
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
      // @TODO retore this when NCM is added
      // it('should display the "Non class meetings" link', function () {
      // const link = queryByText('Non class meetings');
      // assert(link);
      // });
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
    context('When user is read only', function () {
      let queryByText: BoundFunction<QueryByText>;
      beforeEach(function () {
        ({ queryByText } = render(
          <AppHeader />,
          {
            currentUser: dummy.readOnlyUser,
          }
        ));
      });
      it('should display the "Schedule" link', function () {
        const link = queryByText('Schedule');
        assert(link);
      });
      it('should display the "Room Schedule" link', function () {
        const link = queryByText('Room Schedule');
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
      // @TODO retore this when NCM is added
      // it('should display the "Non class meetings" link', function () {
      // const link = queryByText('Non class meetings');
      // assert(link);
      // });
      it('should display the "Faculty" link', function () {
        const link = queryByText('Faculty');
        assert(link);
      });
      it('should NOT display the "Course Admin" link', function () {
        const link = queryByText('Course Admin');
        assert.strictEqual(link, null);
      });
      it('should NOT display the "Faculty Admin" link', function () {
        const link = queryByText('Faculty Admin');
        assert.strictEqual(link, null);
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
        <AppHeader />,
        {
          currentUser: new User({}),
        }
      ));
    });
    it('Should display a log in button', function () {
      const login = queryByText('Log In') as HTMLLinkElement;
      notStrictEqual(login, null);
      strictEqual(login.href, `${process.env.SERVER_URL}/login`);
    });
    it('Should not display a log out button', function () {
      const logout = queryByText('Log Out') as HTMLLinkElement;
      strictEqual(logout, null);
    });
    it('should display the "Schedule" link', function () {
      const link = queryByText('Schedule');
      assert(link);
    });
    it('should display the "Room Schedule" link', function () {
      const link = queryByText('Room Schedule');
      assert(link);
    });
    it('should display the "4 Year Plan" link', function () {
      const link = queryByText('4 Year Plan');
      assert(link);
    });
    it('should NOT display the "Courses" link', function () {
      const link = queryByText('Courses');
      assert.strictEqual(link, null);
    });
    it('should NOT display the "Non class meetings" link', function () {
      const link = queryByText('Non class meetings');
      assert.strictEqual(link, null);
    });
    it('should NOT display the "Faculty" link', function () {
      const link = queryByText('Faculty');
      assert.strictEqual(link, null);
    });
    it('should NOT display the "Course Admin" link', function () {
      const link = queryByText('Course Admin');
      assert.strictEqual(link, null);
    });
    it('should NOT display the "Faculty Admin" link', function () {
      const link = queryByText('Faculty Admin');
      assert.strictEqual(link, null);
    });
    it('Should not display a log out link', function () {
      const link = queryByText('Log Out');
      assert.strictEqual(link, null);
    });
  });
});
