import { createContext, Reducer, Dispatch } from 'react';
import { AppMessage, MESSAGE_ACTION } from '../classes';

/**
 * A function that passes down a message to the queue
 */
export type DispatchMessage = Dispatch<MessageReducerAction>;

/**
 * Global message provider
 */

export const MessageContext = createContext<DispatchMessage>(null);

/**
 * handles queueing logic for the top-level app component
 */

/**
 * Defines the state of the message reducer
 */

export interface MessageReducerState {
  queue: AppMessage[];
  currentMessage: AppMessage;
}

/**
 * Defines that kinds of actions that can be accepted by the reducer
 */

export interface MessageReducerAction {
  type: MESSAGE_ACTION;
  message?: AppMessage;
}


export const messageReducer:
Reducer<MessageReducerState, MessageReducerAction> = (
  state,
  action
): MessageReducerState => {
  const { currentMessage, queue } = state;
  switch (action.type) {
    case (MESSAGE_ACTION.PUSH): {
      if (!currentMessage) {
        return ({
          ...state,
          currentMessage: action.message,
        });
      }
      const newQueue = [...queue, action.message];
      return {
        ...state,
        queue: newQueue,
      };
    }
    case (MESSAGE_ACTION.CLEAR): {
      const nextQueue = [...queue];
      const nextMessage = nextQueue.shift();
      return {
        queue: nextQueue,
        currentMessage: nextMessage,
      };
    }
    default:
      return state;
  }
};
