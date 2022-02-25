import React, {
  ReactElement,
  ReactNode,
  useRef,
  Dispatch,
  useState,
  useEffect,
} from 'react';
import {
  render,
  RenderResult,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MarkOneWrapper } from 'mark-one';
import {
  MessageContext,
  DispatchMessage,
  MessageReducerAction,
  UserContext,
} from 'client/context';
import { MetadataContext, MetadataContextValue } from 'client/context/MetadataContext';
import { Message } from 'client/components/layout';
import { metadata } from '../data/metadata';
import { adminUser } from '../data/users';
import { User } from '../../classes';

const currentMetadata = { ...metadata };

const testMetadata = new MetadataContextValue(currentMetadata, (update) => {
  Object.assign(currentMetadata, update);
});

/**
 * Defines a set of additional options that can be passed as the second
 * argument to a `render` call to stub/spy on specific properties. Sane
 * defaults are provided so that all options are indeed optional
 */

interface CustomRenderOptions {
  dispatchMessage?: DispatchMessage;
  metadataContext?: MetadataContextValue;
  routerEntries?: string[];
  currentUser?: User;
}

/**
 * In order to streamline our tests, we are redefining the `render` function to
 * include the Memory Router, Theme Provider, and Message Context Provider to
 * avoid having to redefine an App Stub for each test
 */
const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  let {
    dispatchMessage,
    metadataContext,
    routerEntries,
    currentUser,
  } = options;
  if (!dispatchMessage) {
    dispatchMessage = () => {};
  }
  if (!metadataContext) {
    metadataContext = testMetadata;
  }
  if (!routerEntries) {
    routerEntries = ['/'];
  }
  if (!currentUser) {
    currentUser = adminUser;
  }
  return render(
    <MemoryRouter initialEntries={routerEntries}>
      <MarkOneWrapper>
        <UserContext.Provider value={currentUser}>
          <MessageContext.Provider value={dispatchMessage}>
            <MetadataContext.Provider value={metadataContext}>
              {ui}
            </MetadataContext.Provider>
          </MessageContext.Provider>

        </UserContext.Provider>
      </MarkOneWrapper>
    </MemoryRouter>
  );
};

/**
 * A set of options that can be used in the Messageable function component.
 */
interface MessageableProps {
  /** The elements to be displayed inside the Header */
  children: ReactNode;
  metadataContext?: MetadataContextValue;
  routerEntries?: string[];
}

/**
 * Defines a set of additional options that can be passed as the second
 * argument to a `render` call to stub/spy on specific properties.
 */
interface RenderWithMessagingOptions {
  metadataContext?: MetadataContextValue;
  routerEntries?: string[];
}

/**
 * A component that includes the content of the queue of messages.
 * This functional component is needed in order to use the hook useReducer.
 * This component gets passed into the renderWithMessaging function.
 */
const Messagable = ({
  children,
  metadataContext,
  routerEntries,
}: MessageableProps) => {
  const dispatchMessageRef = useRef<Dispatch<MessageReducerAction>>();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (dispatchMessageRef.current) {
      setLoaded(true);
    }
  }, [dispatchMessageRef, setLoaded]);
  return (
    <div>
      <MarkOneWrapper>
        <MemoryRouter initialEntries={routerEntries}>
          <MessageContext.Provider value={dispatchMessageRef.current}>
            <MetadataContext.Provider value={metadataContext}>
              <Message dispatchMessageRef={dispatchMessageRef} />
              {loaded ? children : null}
            </MetadataContext.Provider>
          </MessageContext.Provider>
        </MemoryRouter>
      </MarkOneWrapper>
    </div>
  );
};

Messagable.defaultProps = {
  metadataContext: {},
  routerEntries: [],
};

/**
 * A function that renders all that is included in the Messageable function
 * component, which includes the content of the message queue.
 */
const renderWithMessaging = (
  ui: ReactElement,
  options: RenderWithMessagingOptions = {}
): RenderResult => {
  let {
    metadataContext,
    routerEntries,
  } = options;
  if (!metadataContext) {
    metadataContext = testMetadata;
  }
  if (!routerEntries) {
    routerEntries = ['/'];
  }
  return render(
    <Messagable metadataContext={metadataContext} routerEntries={routerEntries}>
      {ui}
    </Messagable>
  );
};

export * from '@testing-library/react';
export { customRender as render, renderWithMessaging };
