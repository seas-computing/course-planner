import { hot } from 'react-hot-loader/root';
import React, {
  useState,
  useEffect,
  useReducer,
  ReactElement,
  FunctionComponent,
} from 'react';
import {
  Switch,
  Route,
  Redirect,
  useLocation,
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
  MetadataContext,
} from 'client/context';
import {
  MarkOneWrapper,
  Header,
  TabList,
  TabListItem,
  PageBody,
  Logo,
  PageTitle,
  Link,
} from 'mark-one';
import { getCurrentUser } from 'client/api';
import { getMetadata } from 'client/api/metadata';
import { User } from 'common/classes';
import { Message } from './layout';
import NoMatch from './pages/NoMatch';
import logo from '../img/seas-logo.svg';
import CourseAdmin from './pages/CourseAdmin';
import FacultyAdmin from './pages/FacultyAdmin';
import FacultyPage from './pages/Faculty/FacultyPage';
import CourseInstanceList from './pages/Courses/CoursesPage';
import MultiYearPlan from './pages/MultiYearPlan';

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
   * Get the currently authenticated user from the server on launch.
   * If it fails, display a message for the user
   */

  useEffect((): void => {
    getCurrentUser()
      .then((user: User): User => {
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
  }, [setUser, dispatchMessage]);

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

  useEffect((): void => {
    getMetadata()
      .then((metadata): void => {
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
  }, []);

  const { pathname: currentPath } = useLocation();

  const tabs: { link: string; text: string }[] = [
    { link: '/courses', text: 'Courses' },
    { link: '/non-class-meetings', text: 'Non class meetings' },
    { link: '/faculty', text: 'Faculty' },
    { link: '/schedule', text: 'Schedule' },
    { link: '/four-year-plan', text: '4 Year Plan' },
    { link: '/course-admin', text: 'Course Admin' },
    { link: '/faculty-admin', text: 'Faculty Admin' },
  ];

  return (
    <div className="app">
      <MarkOneWrapper>
        <UserContext.Provider value={currentUser}>
          <MessageContext.Provider value={dispatchMessage}>
            <MetadataContext.Provider value={currentMetadata}>
              <div className="app-content">
                <Header justify="left">
                  <Logo href="/" image={logo}>SEAS Logo</Logo>
                  <PageTitle>Course Planning</PageTitle>
                </Header>
                <nav>
                  <TabList>
                    {tabs.map((tab): ReactElement => (
                      <TabListItem
                        isActive={tab.link === currentPath}
                        key={tab.text}
                      >
                        <Link to={tab.link}>
                          {tab.text}
                        </Link>
                      </TabListItem>
                    ))}
                  </TabList>
                </nav>
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
                    <Redirect from="/" exact to="/courses" />
                    <Route path="/courses" component={CourseInstanceList} />
                    <Route path="/course-admin" component={CourseAdmin} />
                    <Route exact path="/faculty" component={FacultyPage} />
                    <Route path="/faculty-admin" component={FacultyAdmin} />
                    <Route path="/four-year-plan" component={MultiYearPlan} />
                    <Route component={NoMatch} />
                  </Switch>
                </PageBody>
              </div>
            </MetadataContext.Provider>
          </MessageContext.Provider>
        </UserContext.Provider>
      </MarkOneWrapper>
    </div>
  );
};

export default App;
