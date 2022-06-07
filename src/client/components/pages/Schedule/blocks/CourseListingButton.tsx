import styled from 'styled-components';

/**
 * An essentially unstyled button used to trigger the Popover containing the
 * course details
 */
const CourseListingButton = styled.button.attrs({
  type: 'button',
})`
  background: transparent;
  border: none;
  font-size: inherit;
  padding: 0;
  margin: 0;
  width: 100%;
  cursor: pointer;
  text-align: left;
`;

export default CourseListingButton;
