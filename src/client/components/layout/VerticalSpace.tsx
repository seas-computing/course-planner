import { ReactNode } from 'react';
import { fromTheme } from 'mark-one';
import styled from 'styled-components';

const StyledVerticalSpace = styled.div`
  margin: ${fromTheme('ws', 'xsmall')};
`;

export default StyledVerticalSpace;
