import { Footer } from 'mark-one';
import styled from 'styled-components';

/**
 * A styled footer component to render Policy links and items
 */

const CustomFooter = styled(Footer)`
ul {
  list-style: none;
  display: flex;
  li {
    padding: 0 0.5rem;
    border-right: 1px solid black;
    &:last-of-type {
      border: 0px;
    }
}`;

export default CustomFooter;
