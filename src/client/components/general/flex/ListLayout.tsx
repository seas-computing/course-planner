import styled from 'styled-components';
import { fromTheme } from 'mark-one';

/**
 * A styled list item element used to position its children
 */
export default styled.li`
  align-items: center;
  border-bottom: ${fromTheme('border', 'light')};
  display: flex;
  flex-direction: row;
  padding: ${fromTheme('ws', 'small')};
`;
