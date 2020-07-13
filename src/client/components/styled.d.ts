import 'styled-components';
import { BaseTheme } from 'mark-one';

/**
 * This module declaration will override the implicit type of `theme` for all
 * styled-components with the BaseTheme from MarkOne.
 */

declare module 'styled-components' {
  // eslint-disable-next-line
  export interface DefaultTheme extends BaseTheme {}
}
