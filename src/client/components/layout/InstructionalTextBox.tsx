import { fromTheme } from 'mark-one';
import styled from 'styled-components';

const StyledInstructionalTextBox = styled.div`
  border: ${fromTheme('border', 'light')};
  margin-top: ${fromTheme('ws', 'xsmall')};
  margin-bottom: ${fromTheme('ws', 'xsmall')};
  padding: ${fromTheme('ws', 'xsmall')};
  font-family: ${fromTheme('font', 'note', 'family')};
  font-size: ${fromTheme('font', 'note', 'size')};
  & p {
    margin-bottom: 0.5em;
  }
`;

export default StyledInstructionalTextBox;
