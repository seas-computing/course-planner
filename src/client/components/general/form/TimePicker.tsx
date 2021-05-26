import React, {
  ChangeEventHandler,
  FunctionComponent,
  ReactElement,
} from 'react';
import { fromTheme } from 'mark-one';
import styled from 'styled-components';

interface DropdownOptionProps {
  /** The label of the dropdown option */
  label: string;
  /** The value of the dropdown option */
  value: string;
}

export interface TimePickerProps {
  /** The id of the dropdown */
  id: string;
  /** The identifying name of the dropdown */
  name: string;
  /** The currently selected dropdown value */
  value: string;
  /** An array of objects with the properties specified through DropdownOptions */
  options: Array<DropdownOptionProps>;
  /** Function to call on change event */
  onChange: ChangeEventHandler;
}

const StyledTimePicker = styled.select`
  color: ${fromTheme('color', 'text', 'dark')};
`;

/**
 * Renders a time picker dropdown in which the option selected populates other
 * fields and selecting an item in the dropdown does not change the selected
 * item displayed when the dropdown closes.
 */
const TimePicker: FunctionComponent<TimePickerProps> = ({
  id,
  name,
  value,
  options,
  onChange,
}: TimePickerProps): ReactElement => (
  <StyledTimePicker
    id={id}
    onChange={onChange}
    name={name}
    value={value}
  >
    {options.map((option) => (
      <option
        value={option.value}
        key={option.value}
      >
        {option.label}
      </option>
    ))}
  </StyledTimePicker>
);

export default TimePicker;
