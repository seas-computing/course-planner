import { strictEqual } from 'assert';
import * as dummy from 'testData';
import { messageReducer, MessageReducerState } from '../MessageContext';
import { AppMessage, MESSAGE_ACTION } from '../../classes';

describe('Message Reducer', function () {
  let reducedState: MessageReducerState;
  let testMessage: AppMessage;
  describe('Pushing onto the queue', function () {
    context('With no current message', function () {
      beforeEach(function () {
        testMessage = new AppMessage(dummy.string);
        reducedState = messageReducer(
          {
            queue: [],
            currentMessage: null,
          },
          {
            type: MESSAGE_ACTION.PUSH,
            message: testMessage,
          }
        );
      });
      it('Should leave the queue empty', function () {
        strictEqual(reducedState.queue.length, 0);
      });
      it('Should set the current message to action message', function () {
        strictEqual(reducedState.currentMessage, testMessage);
      });
    });
    context('With a current message in state', function () {
      let oldCurrentMessage: AppMessage;
      context('and nothing in the queue', function () {
        beforeEach(function () {
          testMessage = new AppMessage(dummy.string);
          oldCurrentMessage = new AppMessage('Old Current Message');
          reducedState = messageReducer(
            {
              queue: [],
              currentMessage: oldCurrentMessage,
            },
            {
              type: MESSAGE_ACTION.PUSH,
              message: testMessage,
            }
          );
        });
        it('Should leave the current Message as is', function () {
          strictEqual(reducedState.currentMessage, oldCurrentMessage);
        });
        it('Should add the new action message to the queue', function () {
          strictEqual(reducedState.queue.length, 1);
          strictEqual(reducedState.queue[0], testMessage);
        });
      });
      context('and one in the queue', function () {
        let oldQueuedMessage: AppMessage;
        beforeEach(function () {
          testMessage = new AppMessage(dummy.string);
          oldCurrentMessage = new AppMessage('Old Current Message');
          oldQueuedMessage = new AppMessage('Old Queued Message');
          reducedState = messageReducer(
            {
              queue: [oldQueuedMessage],
              currentMessage: oldCurrentMessage,
            },
            {
              type: MESSAGE_ACTION.PUSH,
              message: testMessage,
            }
          );
        });
        it('Should leave the old queued message first in queue', function () {
          strictEqual(reducedState.queue[0], oldQueuedMessage);
        });
        it('Should leave the old current message in place', function () {
          strictEqual(reducedState.currentMessage, oldCurrentMessage);
        });
        it('Should add the new message to the end of the queue', function () {
          strictEqual(reducedState.queue.length, 2);
          strictEqual(reducedState.queue[1], testMessage);
        });
      });
    });
  });
  describe('clearing the current Message', function () {
    context('With no current message', function () {
      beforeEach(function () {
        reducedState = messageReducer(
          {
            queue: [],
            currentMessage: null,
          },
          {
            type: MESSAGE_ACTION.CLEAR,
          }
        );
      });
      it('Should leave the queue empty', function () {
        strictEqual(reducedState.queue.length, 0);
      });
      it('Should set the current message to undefined', function () {
        strictEqual(reducedState.currentMessage, undefined);
      });
    });
    context('With a current message in state', function () {
      context('and nothing in the queue', function () {
        beforeEach(function () {
          testMessage = new AppMessage('Old Current Message');
          reducedState = messageReducer(
            {
              queue: [],
              currentMessage: testMessage,
            },
            {
              type: MESSAGE_ACTION.CLEAR,
            }
          );
        });
        it('Should leave the queue empty', function () {
          strictEqual(reducedState.queue.length, 0);
        });
        it('Should set the current Message to undefined', function () {
          strictEqual(reducedState.currentMessage, undefined);
        });
      });
      context('and one in the queue', function () {
        let queuedMessage: AppMessage;
        beforeEach(function () {
          testMessage = new AppMessage('Old Current Message');
          queuedMessage = new AppMessage('Old Queued Message');
          reducedState = messageReducer(
            {
              queue: [queuedMessage],
              currentMessage: testMessage,
            },
            {
              type: MESSAGE_ACTION.CLEAR,
            }
          );
        });
        it('Should empty the queue', function () {
          strictEqual(reducedState.queue.length, 0);
        });
        it('Should replace the current message with the queued message', function () {
          strictEqual(reducedState.currentMessage, queuedMessage);
        });
      });
    });
  });
});
