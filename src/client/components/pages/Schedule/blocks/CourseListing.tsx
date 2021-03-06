import styled from 'styled-components';
import { ReactElement } from 'react';

/**
 * The listing for the catalog number of a single course within a session block
 */
const CourseListing = styled.li`
  font-size: .8em;
  color: #000000;
  text-align: left;
`;

declare type CourseListing = ReactElement<{children: string}>;

export default CourseListing;
