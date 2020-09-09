import { ReactNode } from 'react';
import { fromTheme } from 'mark-one';
import styled from 'styled-components';

interface VerticalSpaceProps {
  /** Specifies the content around which the VerticalSpace will wrap */
  children?: ReactNode;
}

const StyledVerticalSpace = styled.div<VerticalSpaceProps>`
  margin: ${fromTheme('ws', 'xsmall')};
`;

export default StyledVerticalSpace;
