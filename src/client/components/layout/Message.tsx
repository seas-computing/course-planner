import { GlobalMessage } from 'mark-one';
import React, {
  ReactElement,
  FunctionComponent,
  Dispatch,
  useReducer,
  useEffect,
  MutableRefObject,
} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { MESSAGE_ACTION } from '../../classes';
import messageTypeToVariant from '../pages/utils/messageHelperFunctions';
import {
  MessageReducerAction,
  messageReducer,
} from '../../context';

export interface MessageProps {
  /**
   * A mutable ref that we can use to pass the dispatchMessage function back up to top-level App
   */
  dispatchMessageRef: MutableRefObject<Dispatch<MessageReducerAction>>;
}

/**
 * A wrapper component for the Global Message component to position it at the
 * bottom of the page
 */
const GlobalMessageWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
`;

/**
 * Define our initial values for the queue and currentMessage, both of which
 * should be empty
 */
const initialMessageState = {
  queue: [],
  currentMessage: null,
};

const Message: FunctionComponent<MessageProps> = ({
  dispatchMessageRef,
}): ReactElement => {
  /**
   * Set up local reducer for maintaining the current app-wide message
   * queue. The dispatchMessage function will be passed back up into the App
   * through the dispatchMessageRef, then pass down through the rest of the app
   * through the Message Context Provider
   * */

  const [messageState, dispatchMessage] = useReducer(
    messageReducer,
    initialMessageState
  );

  /**
   * Assigns the dispatchMessage method to ref.current. Refs are inherently
   * mutable and are intended to be reassigned directly, so it is safe to
   * ignore the eslint rule here.
   */
  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    dispatchMessageRef.current = dispatchMessage;
  }, [dispatchMessageRef]);

  const {
    queue,
    currentMessage,
  } = messageState;

  /**
   * Render our message as a portal attached to the document body, since we
   * want it to appear at the bottom of the dom.
   */
  return createPortal((
    <div>
      {currentMessage
      && (
        <GlobalMessageWrapper>
          <GlobalMessage
            variant={messageTypeToVariant(currentMessage.variant)}
            buttonAlt="Close alert dialog"
            buttonLabel={queue.length > 0 ? `Next (${queue.length})` : 'Clear'}
            onClick={(): void => {
              dispatchMessage({ type: MESSAGE_ACTION.CLEAR });
            }}
          >
            {currentMessage.text}
          </GlobalMessage>
        </GlobalMessageWrapper>
      )}
    </div>
  ), document.querySelector('body'));
};

export default Message;
