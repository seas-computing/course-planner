import { fromTheme } from 'mark-one';
import styled from 'styled-components';

interface CourseListingButtonProps {
  /**
   * Whether this button should have a highlighted background
   */
  isHighlighted?: boolean;
}
/**
 * An essentially unstyled button used to trigger the Popover containing the
 * course details
 */
const CourseListingButton = styled.button.attrs({
  type: 'button',
})<CourseListingButtonProps>`
  background-color: ${({ isHighlighted }) => (
    isHighlighted ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
  )};
  border: none;
  font-size: inherit;
  &:disabled {
    color: ${fromTheme('color', 'text', 'medium')};
    opacity: 0.8;
  }
  padding: 0;
  margin: 0;
  width: 100%;
  cursor: ${({ disabled }) => (disabled ? '' : 'pointer')};
  text-align: left;
`;

export default CourseListingButton;
