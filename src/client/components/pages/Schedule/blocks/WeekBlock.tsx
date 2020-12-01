import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { DayBlock } from '.';

interface WeekBlockProps {
  /**
   * The number of rows in the grid. For consistency, the grid rows should be
   * set by the parent component to be the same as the DayBlock
   */
  numRows: number;

  /**
   * The number of the minutes represented by each row in the grid, which
   * should be consistent with the other components in the Schedule
   */
  minuteResolution: number;

  /**
   * The first hour that should be displayed in the schedule
   */
  firstHour: number;

  /**
   * The WeekBlock receive multiple DayBlocks as its children
   */
  children: DayBlock[];

  /**
   * The height of each row in the grid, which should be consistent with the
   * value used in the DayBlock
   */
  rowHeight: string;
}

/**
 * Takes the numRows and rowHeight props from the WeekBlock
 */
type WeekBlockWrapperProps = Pick<WeekBlockProps, 'numRows' | 'rowHeight'>;

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
 * styled, solid for hours and dashed for 15 minute intervals
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
  grid-row: ${({ row }) => row - 1};
`;

/**
 * A solid (for hour marks) or dashed (for 15 minute marks) rule that extends
 * across the week display
 */

const TimeRule = styled.div<TimeRuleProps>`
  grid-row: ${({ row }) => row};
  grid-column: 1 / 7;
  border-bottom: ${({ rowStyle }) => `2px ${rowStyle} #ccc`};
  margin-left: 3em;
`;

/**
 * A wrapper around the entire week, which sets up the time-based grid.
 */

const WeekBlockWrapper = styled.div<WeekBlockWrapperProps>`
  display: grid;
  grid-template-columns: 3em repeat(5, minmax(300px, 1fr));
  grid-template-rows: ${({ numRows, rowHeight }) => `3em repeat(${numRows}, ${rowHeight})`};
  grid-gap: 0em;
  padding: 0em;
  width: 100vw;
  height: 100vh;
  overflow: scroll;
`;

/**
 * Represents the view of the entire week. Includes five slots for the days of
 * the week, and uses teh same row grid as each DayBlock to display horizontal
 * rules across the week at fifteen minute intervals.
 */

const WeekBlock: FunctionComponent<WeekBlockProps> = ({
  firstHour,
  numRows,
  children,
  minuteResolution,
  rowHeight,
}) => {
  const fifteen = Math.floor(15 / minuteResolution);
  const sixty = Math.floor(60 / minuteResolution);
  return (
    <WeekBlockWrapper numRows={numRows} rowHeight={rowHeight}>
      {Array.from({ length: numRows + 1 }, (_, row: number) => {
        if (row > 0) {
          if (row === 1 || row % sixty === 0) {
            const hour = Math.floor(row / sixty) + firstHour;
            let hourString = `${hour}am`;
            if (hour >= 12) {
              hourString = `${hour === 12 ? hour : hour - 12}pm`;
            }
            return (
              <React.Fragment key={hourString}>
                <HourHead row={row}>
                  {hourString}
                </HourHead>
                {row !== numRows && [0, 1, 2, 3].map((min:number) => {
                  const minBlock = min * fifteen;
                  return (
                    <TimeRule
                      row={row + minBlock}
                      rowStyle={min === 0 ? ROW_STYLE.SOLID : ROW_STYLE.DASHED}
                      key={`${hour}:${minBlock}`}
                    />
                  );
                })}
              </React.Fragment>
            );
          }
        }
        return null;
      })}
      {children}
    </WeekBlockWrapper>
  );
};

export default WeekBlock;
