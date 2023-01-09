import styled from 'styled-components';

/**
 * A wrapper used to add a secondary layer of flex positioning for a group
 * of options. The options will be right-aligned.
 */
export default styled.div`
  display: flex;
  flex-direction: row;
  gap: 5%;
  justify-content: flex-end;
  align-items: baseline;
  align-self: center;
`;
