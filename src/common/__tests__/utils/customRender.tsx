import React, {
  ReactElement,
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
} from 'client/context';
import { MetadataContext, MetadataContextValue } from 'client/context/MetadataContext';
import { metadata } from '../data/metadata';

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
  } = options;
  if (!dispatchMessage) {
    dispatchMessage = () => {};
  }
  if (!metadataContext) {
    metadataContext = testMetadata;
    console.log('Test metadata areas in customRender: ', testMetadata.areas); // fdo
  }
  if (!routerEntries) {
    routerEntries = ['/'];
  }
  return render(
    <MemoryRouter initialEntries={routerEntries}>
      <MarkOneWrapper>
        <MessageContext.Provider value={dispatchMessage}>
          <MetadataContext.Provider value={metadataContext}>
            {ui}
          </MetadataContext.Provider>
        </MessageContext.Provider>
      </MarkOneWrapper>
    </MemoryRouter>
  );
};

export * from '@testing-library/react';
export { customRender as render };
