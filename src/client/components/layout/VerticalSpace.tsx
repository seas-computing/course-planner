import React, { FunctionComponent, ReactElement, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';

interface VerticalSpaceProps {
  /** Specifies the height of the vertical space */
  height?: string;
  /** Specifies the test id of the component for testing purposes */
  testId?: string
}

const StyledVerticalSpace = styled.div<VerticalSpaceProps>`
  height: ${({ height }) => height};
`;

export const VerticalSpace: FunctionComponent<VerticalSpaceProps> = (props):
ReactElement => {
  const {
    height,
    testId,
  } = props;
  const theme = useContext(ThemeContext);
  return (
    <StyledVerticalSpace
      height={height == null ? theme.ws.xsmall : height}
      data-testid={testId}
    />
  );
};
