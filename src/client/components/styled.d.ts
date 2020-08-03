import 'styled-components';
import { VARIANT } from 'mark-one';
import {
  ColorRange,
  TextColors,
  AcademicArea,
  FontCategory,
  ShadowWeight,
  BorderWeight,
  WhiteSpaceSize,
  FontSpec,
} from 'mark-one/lib/Theme/ThemeTypes';

declare module 'styled-components' {
  export interface DefaultTheme {
    color: {
      background:{
        [K in VARIANT | keyof ColorRange]:
        K extends VARIANT
          ? ColorRange
          : string;
      }
      text: {
        [key in TextColors]: string;
      };
      area: {
        [key in AcademicArea]: string;
      };
    };
    font: {
      [key in FontCategory]: FontSpec;
    };
    shadow: {
      [key in ShadowWeight]: string
    };
    border: {
      [key in BorderWeight]: string
    };
    ws: {
      [key in WhiteSpaceSize]: string
    };
  }
}
