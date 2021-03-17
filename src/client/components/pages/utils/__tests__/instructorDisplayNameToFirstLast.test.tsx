import { strictEqual } from 'assert';
import { instructorDisplayNameToFirstLast } from '../instructorDisplayNameToFirstLast';

describe('Instructor Display Name to First Last Function', function () {
  context('when the display name is an empty string', function () {
    it('should return an empty string', function () {
      strictEqual(
        instructorDisplayNameToFirstLast(''),
        ''
      );
    });
  });
  context('when the display name is one word', function () {
    it('should return the word itself', function () {
      strictEqual(
        instructorDisplayNameToFirstLast('TBD'),
        'TBD'
      );
    });
  });
  context('when the display name contains a comma', function () {
    it('should return the name in the first last name format', function () {
      strictEqual(
        instructorDisplayNameToFirstLast('Protopapas, Pavlos'),
        'Pavlos Protopapas'
      );
    });
  });
});
