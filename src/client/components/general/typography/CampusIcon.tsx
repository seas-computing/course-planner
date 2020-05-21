import React, { ReactElement, FunctionComponent } from 'react';
import styled from 'styled-components';
import HiddenText from './HiddenText';

export interface CampusIconProps {
  /**
   * The full name of the campus
   */
  children: string;
}


const StyledCampusIcon = styled.strong`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }): string => (theme.color.text.dark)};
  color:  ${({ theme }): string => (theme.color.text.light)};
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  font-size: ${({ theme }): string => (theme.font.bold.size)};
  font-weight: ${({ theme }): string => (theme.font.bold.weight)};
  font-family: ${({ theme }): string => (theme.font.bold.family)};
`;

/**
 * Renders the first letter of the campus name as white text in a black circle,
 * then renders the remaining characters as hiddent text so that the full
 * campus name will be read by screen readers.
 */

const CampusIcon: FunctionComponent<CampusIconProps> = ({
  children,
}): ReactElement => {
  const [initial, ...rest] = children;
  return (
    <span>
      <StyledCampusIcon title={children}>{initial}</StyledCampusIcon>
      <HiddenText>{rest.join('')}</HiddenText>
    </span>
  );
};

export default CampusIcon;
