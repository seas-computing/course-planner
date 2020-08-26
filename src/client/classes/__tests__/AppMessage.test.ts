import { strictEqual } from 'assert';
import { AppMessage, MESSAGE_TYPE } from '..';
import * as dummy from '../../../common/data';

describe('AppMessage', function () {
  describe('Constructor', function () {
    let message: AppMessage;
    describe('With an explicit type', function () {
      beforeEach(function () {
        message = new AppMessage(dummy.string, MESSAGE_TYPE.ERROR);
      });
      it('Should set the message text to the provided value', function () {
        strictEqual(message.text, dummy.string);
      });
      it('Should set the variant to the provided value', function () {
        strictEqual(message.variant, MESSAGE_TYPE.ERROR);
      });
    });
    describe('Without an explicit type', function () {
      beforeEach(function () {
        message = new AppMessage(dummy.string);
      });
      it('Should set the message text to the provided value', function () {
        strictEqual(message.text, dummy.string);
      });
      it('Should set the variant to info', function () {
        strictEqual(message.variant, MESSAGE_TYPE.INFO);
      });
    });
  });
});
