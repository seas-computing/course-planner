// import { ReactElement, ReactNode } from 'react';
// import styled, { withTheme } from 'styled-components';
// import MarkOneTheme from 'mark-one';

// export interface SpaceProps {
//   /**
//    * Allows for applying a custom background color
//    * @default "transparent"
//    * */
//   padding?: string;
//   /** The elements to be displayed inside the Header */
//   children: ReactNode;
//   /**
//    * Pass in a custom value for justify-content
//    * @default space-between
//    * */
//   justify?: string;
//   /** the app theme */
//   theme: BaseTheme;
// }

// /**
//  * A full-width header to be displayed at the top of the page
//  */

// const Header = styled.div<SpaceProps>`
//   align-items: baseline;
//   background-color: ${({ background }): string => background};
//   display: flex;
//   justify-content: ${({ justify }): string => justify};
//   padding: ${({ theme }): string => `${theme.ws.medium} ${theme.ws.small}`};
//   width: 100%;
// `;

// Header.defaultProps = {
//   background: 'transparent',
//   justify: 'space-between',
// };
