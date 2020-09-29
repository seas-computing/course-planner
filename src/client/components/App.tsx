import React, {
  useState,
  useEffect,
  useReducer,
  ReactElement,
  FunctionComponent,
} from 'react';
import {
  MESSAGE_TYPE,
  MESSAGE_ACTION,
  AppMessage,
} from 'client/classes';
import {
  MessageContext,
  messageReducer,
  UserContext,
  MetadataContext,
} from 'client/context';
import { MarkOneWrapper, PageBody } from 'mark-one';
import { getCurrentUser } from 'client/api';
import { getMetadata } from 'client/api/metadata';
import { User } from 'common/classes';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import {
  Message,
  AppRouter,
  AppHeader,
} from './layout';

/**
 * The primary app component. Fetches the current user from the server when it
 * mounts, then saves it to the UserContext to pass down to other components
 */

const App: FunctionComponent = (): ReactElement => {
  /**
   * Hook for maintaining the currently selected user
   * */

  const [currentUser, setUser] = useState<User | null>(null);

  /**
   * Set up the local reducer for maintaining the current app-wide message
   * queue. The dispatchMessage function will be passed down through the
   * Message Context Provider
   * */

  const [{ currentMessage, queue }, dispatchMessage] = useReducer(
    messageReducer,
    {
      queue: [],
      currentMessage: undefined,
    }
  );

  /**
   * Set up the current metadata containing the current academic year, currently
   * existing areas, and currently existing semesters in the database.
   * The current metadata will be passed down through the Metadata Context
   * Provider.
   */
  const [currentMetadata, setMetadata] = useState({
    currentAcademicYear: null,
    areas: [],
    semesters: [],
  });

  /**
   * Get the currently authenticated user from the server on launch.
   * If it fails, display a message for the user
   */

  useEffect((): void => {
    getCurrentUser()
      .then((user: User): void => {
        if (user) {
          setUser(user);
          getMetadata()
            .then((metadata: MetadataResponse): void => {
              setMetadata(metadata);
            })
            .catch((): void => {
              dispatchMessage({
                message: new AppMessage(
                  'Unable to get metadata from server. If the problem persists, contact SEAS Computing',
                  MESSAGE_TYPE.ERROR
                ),
                type: MESSAGE_ACTION.PUSH,
              });
            });
        }
      })
      .catch((): void => {
        dispatchMessage({
          message: new AppMessage(
            'Unable to get user data from server. If the problem persists, contact SEAS Computing',
            MESSAGE_TYPE.ERROR
          ),
          type: MESSAGE_ACTION.PUSH,
        });
      });
  }, []);

  return (
    <div className="app-content">
      <MarkOneWrapper>
        <UserContext.Provider value={currentUser}>
          <MessageContext.Provider value={dispatchMessage}>
            <MetadataContext.Provider value={currentMetadata}>
              <PageBody>
                <AppHeader />
                {currentMessage
                    && (
                      <Message
                        messageCount={queue.length}
                        messageText={currentMessage.text}
                        messageType={currentMessage.variant}
                      />
                    )}
                <AppRouter />
              </PageBody>
            </MetadataContext.Provider>
          </MessageContext.Provider>
        </UserContext.Provider>
      </MarkOneWrapper>
    </div>
  );
};

export default App;
