import React, {
  ReactElement,
} from 'react';
import {
  render,
  RenderResult,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MarkOneTheme } from 'mark-one';
import {
  MessageContext,
  DispatchMessage,
} from 'client/context';
import { ThemeProvider } from 'styled-components';

/**
 * In order to streamline our tests, we are redefining the `render` function to
 * include the Memory Router, Theme Provider, and Message Context Provider to
 * avoid having to redefine an App Stub for each test
 */

const customRender = (
  ui: ReactElement,
  dispatchMessage: DispatchMessage
): RenderResult => render(
  <MemoryRouter>
    <ThemeProvider theme={MarkOneTheme}>
      <MessageContext.Provider value={dispatchMessage}>
        {ui}
      </MessageContext.Provider>
    </ThemeProvider>
  </MemoryRouter>
);

export * from '@testing-library/react';
export { customRender as render };
