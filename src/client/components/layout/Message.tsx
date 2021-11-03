import { GlobalMessage } from 'mark-one';
import React, { useContext, ReactElement, FunctionComponent } from 'react';
import styled from 'styled-components';
import { MESSAGE_TYPE, MESSAGE_ACTION } from '../../classes';
import { MessageContext } from '../../context';
import messageTypeToVariant from '../pages/utils/messageHelperFunctions';

export interface MessageProps {
  messageCount: number;
  messageText: string;
  messageType: MESSAGE_TYPE;
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

const Message: FunctionComponent<MessageProps> = ({
  messageCount,
  messageText,
  messageType,
}): ReactElement => {
  /**
   * Retrieves the message dispatch function from context
   */

  const messageDispatch = useContext(MessageContext);

  /**
   * auto-clear non-error messages after 5 seconds
   */

  if (messageType !== MESSAGE_TYPE.ERROR) {
    setTimeout((): void => {
      messageDispatch({ type: MESSAGE_ACTION.CLEAR });
    }, 5000);
  }

  return (
    <div className={`app-message-${messageType}`}>
      <GlobalMessageWrapper>
        <GlobalMessage
          variant={messageTypeToVariant(messageType)}
          buttonAlt="Close alert dialog"
          buttonLabel={messageCount > 0 ? `Next (${messageCount})` : 'clear'}
          onClick={(): void => {
            messageDispatch({ type: MESSAGE_ACTION.CLEAR });
          }}
        >
          {messageText}
        </GlobalMessage>
      </GlobalMessageWrapper>
    </div>
  );
};

export default Message;
