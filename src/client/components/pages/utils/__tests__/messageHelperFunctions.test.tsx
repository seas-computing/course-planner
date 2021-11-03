import { strictEqual } from 'assert';
import { MESSAGE_TYPE } from 'client/classes';
import { VARIANT } from 'mark-one';
import messageTypeToVariant from '../messageHelperFunctions';

describe('Message Type to Variant Function', function () {
  context('when message type is MESSAGE_TYPE.ERROR', function () {
    it('should return the negative variant', function () {
      strictEqual(
        messageTypeToVariant(MESSAGE_TYPE.ERROR),
        VARIANT.NEGATIVE
      );
    });
  });
  context('when message type is MESSAGE_TYPE.SUCCESS', function () {
    it('should return the success variant', function () {
      strictEqual(
        messageTypeToVariant(MESSAGE_TYPE.SUCCESS),
        VARIANT.POSITIVE
      );
    });
  });
  context('when message type is neither MESSAGE_TYPE.ERROR nor MESSAGE_TYPE.SUCCESS', function () {
    it('should return the info variant', function () {
      strictEqual(
        messageTypeToVariant(MESSAGE_TYPE.INFO),
        VARIANT.INFO
      );
    });
  });
});
