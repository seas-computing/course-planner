import styled from 'styled-components';

const CellLayout = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: ${({ theme }): string => (theme.ws.xsmall)};
`;

/**
 * Utility component to arrange the list and button in the instructors column
 */

export default CellLayout;
