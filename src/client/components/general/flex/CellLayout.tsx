import styled from 'styled-components';
import { fromTheme } from 'mark-one';

const CellLayout = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: ${fromTheme('ws', 'xsmall')};
`;

/**
 * Utility component to arrange the list and button in the instructors column
 */

export default CellLayout;
