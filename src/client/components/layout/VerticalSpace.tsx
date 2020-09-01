import React, { FunctionComponent, ReactElement, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { fromTheme } from 'mark-one';

interface VerticalSpaceProps {
  height?: string;
}

const StyledVerticalSpace = styled.div<VerticalSpaceProps>`
  height: ${({ height }) => height};
`;

const VerticalSpace: FunctionComponent<VerticalSpaceProps> = (props): ReactElement => {
  const {
    height,
  } = props;
  const theme = useContext(ThemeContext);
  return (
    <StyledVerticalSpace
      height={height == null ? theme.ws.xsmall : height}
    />
  )
};

export default VerticalSpace;
