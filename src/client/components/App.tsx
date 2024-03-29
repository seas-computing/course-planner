import React, {
  useState,
  useEffect,
  ReactElement,
  FunctionComponent,
  Dispatch,
  useRef,
} from 'react';
import {
  MESSAGE_TYPE,
  MESSAGE_ACTION,
  AppMessage,
} from 'client/classes';
import {
  MessageContext,
  UserContext,
  MetadataContext,
  MetadataContextValue,
  MessageReducerAction,
} from 'client/context';
import {
  MarkOneWrapper,
  PageBody,
  LoadSpinner,
  Footer,
  ExternalLink,
} from 'mark-one';
import { getCurrentUser } from 'client/api';
import { getMetadata } from 'client/api/metadata';
import { User } from 'common/classes';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import styled from 'styled-components';
import {
  Message,
  AppRouter,
  AppHeader,
} from './layout';

const appVersion = process.env.APP_VERSION;

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
   * Creates a mutable Ref to pass the dispatchMessage function up from the
   * Message Component. This needs to be in a ref so that we can update it
   * after the App component mounts/renders
   */
  const dispatchMessageRef = useRef<Dispatch<MessageReducerAction>>();

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
    catalogPrefixes: [],
    campuses: [],
  });

  const metadataContext = new MetadataContextValue(currentMetadata,
    setMetadata);

  /**
   * Tracks whether we're still fetching the user and metadata
   */
  const [isDataFetching, setDataFetching] = useState(true);

  /**
   * A custom footer component to render Policy links and items
   */
  const CustomFooter = styled(Footer)`
  ul {
    list-style: none;
    display: flex;
    li {
      padding: 0 0.5rem;
      border-right: 1px solid black;
      &:last-of-type {
        border: 0px;
      }
  }
}
`;

  /**
   * Get the currently authenticated user from the server on launch.
   * If it fails, display a message for the user
   */

  useEffect((): void => {
    if (dispatchMessageRef.current) {
      const { current: dispatchMessage } = dispatchMessageRef;
      setDataFetching(true);
      getCurrentUser()
        .then((user: User): void => {
          setUser(user);
          getMetadata()
            .then((metadata: MetadataResponse): void => {
              setMetadata(metadata);
              setDataFetching(false);
            })
            .catch((): void => {
              dispatchMessage({
                message: new AppMessage(
                  'Unable to get metadata from server. If the problem persists, contact SEAS Computing',
                  MESSAGE_TYPE.ERROR
                ),
                type: MESSAGE_ACTION.PUSH,
              });
              setDataFetching(false);
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
          setDataFetching(false);
        });
    }
  }, [dispatchMessageRef, setDataFetching]);

  return (
    <div className="app-content">
      <MarkOneWrapper>
        <UserContext.Provider value={currentUser}>
          <MessageContext.Provider value={dispatchMessageRef.current}>
            <MetadataContext.Provider value={metadataContext}>
              <PageBody>
                {isDataFetching
                  ? (
                    <LoadSpinner>
                      Fetching User Data
                    </LoadSpinner>
                  )
                  : (
                    <>
                      <AppHeader />
                      <AppRouter />
                      <CustomFooter
                        justify="center"
                      >
                        {appVersion}
                        <ul>
                          <li>
                            © 2023 President and Fellows of Harvard College
                          </li>
                          <li><ExternalLink href="https://seas.harvard.edu/office-diversity-inclusion-and-belonging/about-us" rel="nofollow">Diversity Mission</ExternalLink></li>
                          <li><ExternalLink href="https://trademark.harvard.edu/pages/trademark-notice" rel="nofollow">Trademark Notice</ExternalLink></li>
                          <li><ExternalLink href="https://accessibility.huit.harvard.edu/digital-accessibility-policy" rel="nofollow">Accessibility Policy</ExternalLink></li>
                          <li><ExternalLink href="https://seas.harvard.edu/privacy-policy" rel="nofollow">Privacy Policy</ExternalLink></li>
                        </ul>
                      </CustomFooter>
                    </>
                  )}
                <Message
                  dispatchMessageRef={dispatchMessageRef}
                />
              </PageBody>
            </MetadataContext.Provider>
          </MessageContext.Provider>
        </UserContext.Provider>
      </MarkOneWrapper>
    </div>
  );
};

export default App;
