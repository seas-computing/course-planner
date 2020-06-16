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
import { ThemeProvider } from 'styled-components';
import { MetadataContext } from 'client/context/MetadataContext';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';

/**
 * In order to streamline our tests, we are redefining the `render` function to
 * include the Memory Router, Theme Provider, and Message Context Provider to
 * avoid having to redefine an App Stub for each test
 */
const customRender = (
  ui: ReactElement,
  dispatchMessage: DispatchMessage,
  metadata?: MetadataResponse
): RenderResult => render(
  <MemoryRouter>
    <MarkOneWrapper>
      <MessageContext.Provider value={dispatchMessage}>
        <MetadataContext.Provider value={metadata}>
          {ui}
        </MetadataContext.Provider>
      </MessageContext.Provider>
    </MarkOneWrapper>
  </MemoryRouter>
);

export * from '@testing-library/react';
export { customRender as render };
