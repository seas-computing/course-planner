import React, { createRef, Dispatch } from 'react';
import { strictEqual } from 'assert';
import { fireEvent } from '@testing-library/react';
import * as dummy from 'testData';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { MessageReducerAction } from 'client/context';
import { render } from 'test-utils';
import Message from '../Message';

describe('Message', function () {
  describe('Behavior', function () {
    context('When there is one message', function () {
      it('Should display the message', async function () {
        const dispatchMessageRef = createRef<Dispatch<MessageReducerAction>>();
        const { findByText } = render(
          <Message dispatchMessageRef={dispatchMessageRef} />
        );
        const dispatchMessage = dispatchMessageRef.current;
        dispatchMessage({
          message: new AppMessage(dummy.string, MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
        return findByText(dummy.string);
      });
      it('should just display "Clear" on the button', async function () {
        const dispatchMessageRef = createRef<Dispatch<MessageReducerAction>>();
        const { findByText } = render(
          <Message dispatchMessageRef={dispatchMessageRef} />
        );
        const dispatchMessage = dispatchMessageRef.current;
        dispatchMessage({
          message: new AppMessage(dummy.string, MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
        return findByText('Clear');
      });
    });
    context('When there are multiple messages', function () {
      it('Should show the number of remaining messages on the button', async function () {
        const dispatchMessageRef = createRef<Dispatch<MessageReducerAction>>();
        const { findByRole } = render(
          <Message dispatchMessageRef={dispatchMessageRef} />
        );
        const dispatchMessage = dispatchMessageRef.current;
        dispatchMessage({
          message: new AppMessage(dummy.string, MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
        dispatchMessage({
          message: new AppMessage(dummy.string + ' 2', MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
        const firstMessage = await findByRole('alert');
        strictEqual(firstMessage.firstChild.textContent, dummy.string);
        const nextButton = await findByRole('button');
        strictEqual(nextButton.textContent, 'Next (1)');
        fireEvent.click(nextButton);
        const secondMessage = await findByRole('alert');
        strictEqual(secondMessage.firstChild.textContent, dummy.string + ' 2');
        const clearButton = await findByRole('button');
        strictEqual(clearButton.textContent, 'Clear');
      });
    });
    context('When there are no more messages', function () {
      it('Should display nothing', async function () {
        const dispatchMessageRef = createRef<Dispatch<MessageReducerAction>>();
        const { findByText, queryByRole } = render(
          <Message dispatchMessageRef={dispatchMessageRef} />
        );
        const dispatchMessage = dispatchMessageRef.current;
        dispatchMessage({
          message: new AppMessage(dummy.string, MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
        const clearButton = await findByText('Clear');
        fireEvent.click(clearButton);
        const nothing = queryByRole('alert');
        strictEqual(nothing, null);
      });
    });
  });
});
