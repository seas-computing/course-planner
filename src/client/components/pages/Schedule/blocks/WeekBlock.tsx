import React, { FunctionComponent, ReactEventHandler } from 'react';
import styled from 'styled-components';
import DayBlock from './DayBlock';
import { PGTime } from '../../../../../common/utils/PGTime';

interface WeekBlockProps {
  /**
   * The number of rows in the grid. For consistency, the grid rows should be
   * set by the parent component and should match the DayBlock
   */
  numRows: number;

  /**
   * The number of the minutes represented by each row in the grid, which
   * should be consistent with the other components in the Schedule
   */
  minuteResolution: 1 | 3 | 5 | 15;

  /**
   * The first hour that should be displayed in the schedule
   */
  firstHour: number;

  /**
   * The WeekBlock receives one or more DayBlocks as its children
   */
  children: DayBlock | DayBlock[];

  /**
   * The height of each row in the grid, which should be consistent with the
   * value used in the DayBlock
   */
  rowHeight: string;

  /**
   * The number of day columns (exluding the left-most time column) that should
   * appear in the WeekView
   */
  numColumns: number;

  /**
   * A click handler that can be used to clear the currently popped-over course
   */
  onClick?: ReactEventHandler;
}

/**
 * Takes the numRows and rowHeight props from the WeekBlock
 */
type WeekBlockWrapperProps = Pick<
WeekBlockProps,
'numRows' | 'numColumns' | 'rowHeight'
>;

interface HourHeadProps {
  /**
   * The row within the WeekGrid where the hour should appear
   */
  row: number;

  /**
   * The hour to list in the left margin, e.g., "10am"
   */
  children: string;
}

/**
 * describes two different options for how the line across the grid should be
 * styled, "solid" for hours and "dashed" for 15-minute intervals
 */
enum ROW_STYLE {
  SOLID = 'solid',
  DASHED = 'dashed',
}

interface TimeRuleProps {
  /**
  * The row for the block where the time rule should appear
  */
  row: number;

  /**
   * Whether the line should be dashed or solid
   */
  rowStyle: ROW_STYLE;
}

/**
 * A heading for the hour that appears in the left margin of the week
 */
const HourHead = styled.div<HourHeadProps>`
  grid-column: 1;
  grid-row: ${({ row }) => row + 2};
`;

/**
 * A solid (for hour marks) or dashed (for 15-minute marks) rule that extends
 * across the week display
 */
const TimeRule = styled.div<TimeRuleProps>`
  grid-row: ${({ row }) => row + 2};
  grid-column: 1 / -1;
  border-top: ${({ rowStyle }) => `2px ${rowStyle} #ccc`};
  margin-left: 3em;
`;

/**
 * A wrapper around the entire week, which sets up the time-based grid
 */
const WeekBlockWrapper = styled.div<WeekBlockWrapperProps>`
  display: grid;
  grid-template-columns: ${
  ({ numColumns }) => `3em repeat(${numColumns}, auto)`
};
  grid-template-rows: ${
  ({ numRows, rowHeight }) => `3em repeat(${numRows}, ${rowHeight})`
};
  grid-gap: 0em;
  padding: 0em;
  min-width: max-content;
`;

/**
 * Represents the view of the entire week. Includes slots for days of the week,
 * and uses the same row grid as each DayBlock to display horizontal rules
 * across the week at 15-minute intervals
 */
const WeekBlock: FunctionComponent<WeekBlockProps> = ({
  firstHour,
  numRows,
  numColumns,
  children,
  minuteResolution,
  rowHeight,
  onClick,
}) => {
  // Because our grid-rows do not correspond 1:1 with minutes in the day, we
  // divide by our minute resolution value to determine where our hour and
  // 15-minute marks should go
  const fifteen = 15 / minuteResolution;
  const sixty = 60 / minuteResolution;
  return (
    <WeekBlockWrapper
      numRows={numRows}
      rowHeight={rowHeight}
      numColumns={numColumns}
      onClick={onClick}
    >
      {Array.from(
        // Generate a row every 15 minutes
        { length: numRows / fifteen },
        (_, row: number) => {
          const blockRow = row * fifteen;
          /// Render an hour heading at every fourth 60-minute mark
          if (blockRow % (sixty / fifteen) === 0) {
            // Get the clock hour
            const hour = (blockRow / sixty) + firstHour;
            const { hourHeading } = new PGTime(hour.toString());
            return (
              <React.Fragment key={blockRow}>
                <HourHead row={blockRow}>
                  {hourHeading}
                </HourHead>
                <TimeRule
                  row={blockRow}
                  rowStyle={ROW_STYLE.SOLID}
                />
              </React.Fragment>
            );
          }
          // Render a dashed row at the other 15-minute marks
          return (
            <TimeRule
              row={blockRow}
              rowStyle={ROW_STYLE.DASHED}
              key={blockRow}
            />
          );
        }
      )}
      {children}
    </WeekBlockWrapper>
  );
};

WeekBlock.defaultProps = {
  onClick: () => {},
};

export default WeekBlock;
