import styled from 'styled-components';

/**
 * Small utility component to hide text from display, while keeping it in the
 * available for screen readers.
 */

export default styled.span`
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;
