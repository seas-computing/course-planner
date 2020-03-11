import { hot } from 'react-hot-loader/root';
import React, {
  useState,
  useEffect,
  useReducer,
  ReactElement,
  SFC,
} from 'react';
import {
  Switch,
  Route,
  Link,
  BrowserRouter,
} from 'react-router-dom';
import {
  MESSAGE_TYPE,
  MESSAGE_ACTION,
  AppMessage,
} from 'client/classes';
import {
  MessageContext,
  messageReducer,
  UserContext,
} from 'client/context';
import {
  MarkOneWrapper,
  Header,
  TabList,
  TabListItem,
  PageBody,
} from 'mark-one';
import { getCurrentUser } from 'client/api';
import { UserResponse } from 'common/dto/users/userResponse.dto';
import { Message } from './layout';
import NoMatch from './pages/NoMatch';
import CourseAdmin from './pages/CourseAdmin';

/**
 * The primary app component. Fetches the current user from the server when it
 * mounts, then saves it to the UserContext to pass down to other components
 */

const ColdApp: SFC = (): ReactElement => {
  /**
   * Hook for maintaining the currently selected user
   * */

  const [currentUser, setUser] = useState<UserResponse | null>(null);

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
   * Get the currently authenticated user from the server on launch.
   * If it fails, display a message for the user
   */

  useEffect((): void => {
    getCurrentUser()
      .then(({ data: user }): UserResponse => {
        setUser(user);
        return user;
      })
      .then((user): void => {
        dispatchMessage({
          message: new AppMessage(`Current User: ${user.fullName}`),
          type: MESSAGE_ACTION.PUSH,
        });
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
    <div className="app">
      <MarkOneWrapper>
        <UserContext.Provider value={currentUser}>
          <MessageContext.Provider value={dispatchMessage}>
            <div className="app-content">
              <Header>
                Course Planning
                <TabList>
                  <TabListItem>
                    <Link to="/courses">Courses</Link>
                  </TabListItem>

                  <TabListItem>
                    <Link to="/non-class-meetings">Non class meetings</Link>
                  </TabListItem>

                  <TabListItem>
                    <Link to="/faculty">Faculty</Link>
                  </TabListItem>

                  <TabListItem>
                    <Link to="/schedule">Schedule</Link>
                  </TabListItem>

                  <TabListItem>
                    <Link to="/four-year-plan">4 Year Plan</Link>
                  </TabListItem>

                  <TabListItem>
                    <Link to="/course-admin">Course Admin</Link>
                  </TabListItem>
                </TabList>
              </Header>
              <PageBody>
                {currentMessage
            && (
              <Message
                messageCount={queue.length}
                messageText={currentMessage.text}
                messageType={currentMessage.variant}
              />
            )}
                <Switch>
                  <Route path="/course-admin" component={CourseAdmin} />
                  <Route component={NoMatch} />
                </Switch>
              </PageBody>
            </div>
          </MessageContext.Provider>
        </UserContext.Provider>
      </MarkOneWrapper>
    </div>
  );
};

export const App = hot(ColdApp);
