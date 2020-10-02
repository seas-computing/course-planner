import React, {
  ReactElement, useState,
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
import { MetadataContext } from 'client/context/MetadataContext';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';

interface AppBlueprintProps {
  children: React.ReactNode
  dispatchMessage: DispatchMessage,
  metadata?: MetadataResponse;
}

/**
 * Create a component so that we can call useState to pass in a metadata value
 */
const AppBlueprint = ({
  children,
  dispatchMessage,
  metadata,
}: AppBlueprintProps): ReactElement => {
  const [currentMetadata, setMetadata] = useState(metadata);
  const metadataContext = {
    value: currentMetadata,
    update: setMetadata,
  };
  return (
    <MemoryRouter>
      <MarkOneWrapper>
        <MessageContext.Provider value={dispatchMessage}>
          <MetadataContext.Provider value={metadataContext}>
            {children}
          </MetadataContext.Provider>
        </MessageContext.Provider>
      </MarkOneWrapper>
    </MemoryRouter>
  );
};

AppBlueprint.defaultProps = {
  metadata: {
    currentAcademicYear: (new Date()).getFullYear(),
    areas: [],
    semesters: [],
  },
};

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
  <AppBlueprint dispatchMessage={dispatchMessage} metadata={metadata}>
    {ui}
  </AppBlueprint>
);

export * from '@testing-library/react';
export { customRender as render };
