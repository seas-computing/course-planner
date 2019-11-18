import { strictEqual } from 'assert';
import { regularUser } from 'testData';
import { User } from '../user.entity';

describe('User', function () {
  describe('constructor', function () {
    it('hydrates the class with the data provided', function () {
      const userData = {
        eppn: '123@harvard.edu',
        firstName: 'Jim',
        lastName: 'Waldo',
        email: 'waldo@harvard.edu',
      };

      const user = new User(userData);

      strictEqual(user.eppn, userData.eppn);
      strictEqual(user.email, userData.email);
      strictEqual(user.firstName, userData.firstName);
      strictEqual(user.lastName, userData.lastName);
    });
    it('sets all properties to empty strings if not provided', function () {
      const user = new User();
      strictEqual(user.eppn, '');
      strictEqual(user.email, '');
      strictEqual(user.firstName, '');
      strictEqual(user.lastName, '');
    });
  });
  describe('fullName', function () {
    it('concatenates the user\'s first and last name', function () {
      strictEqual(
        regularUser.fullName,
        `${regularUser.firstName} ${regularUser.lastName}`
      );
    });
  });
  describe('listName', function () {
    it('concatenates the user\'s first and last name', function () {
      strictEqual(
        regularUser.listName,
        `${regularUser.lastName}, ${regularUser.firstName}`
      );
    });
  });
});
