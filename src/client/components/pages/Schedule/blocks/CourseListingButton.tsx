import styled from 'styled-components';

interface CourseListingButtonProps {
  /**
   * Whether this button should have a highlighted background
   */
  isHighlighted?: boolean;

  /**
   * Whether the text of the button should fade into the background, e.g. when
   * one of the other courses in this block is highlighted
   */
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
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
  padding: 0;
  margin: 0;
  width: 100%;
  cursor: pointer;
  text-align: left;
`;

export default CourseListingButton;
