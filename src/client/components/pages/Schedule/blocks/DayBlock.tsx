import React, { FunctionComponent, ReactElement } from 'react';
import styled from 'styled-components';
import SessionBlock from './SessionBlock';

/**
 * The publicly exposed props of the DayBlock, which are in turn passed down to
 * the sub-components
 */

interface DayBlockProps {
  /**
  * Each DayBlock will contain one or more SessionBlocks of courses at the
  * same time
  * */
  children: SessionBlock | SessionBlock[];

  /**
   * The column within the parent WeekBlock under which the day should
   * be placed
   */
  column: number;

  /**
   * The name to display at the top of the DayBlock
   */
  heading: string;

  /**
   * To maintain consistency bewteen the DayBlock and the timerules in the week
   * grid, we'll take a height value from their common parent
   */
  rowHeight: string;

  /**
   * As above, we'll let the parent set the number of rows to make it
   * consistent with the week grid
   */
  numRows: number;
}

/**
 * Take the column prop from the DayBlock
 */
type DayBlockWrapperProps = Pick<DayBlockProps, 'column'>;

/**
 * The DayBlockHeading should only accept the DayBlock children
 */
type DayBlockHeadingProps = {
  children: DayBlockProps['heading'];
};

/**
 * Takes the children, numRows, and rowHeight props from the parent DayBlock
 */
type DayBlockBodyProps = Pick<
DayBlockProps,
'children' | 'numRows' | 'rowHeight'
>;

/**
 * A top level wrapper around the full day, which mainly handles placement
 * within the WeekGrid
 */
const DayBlockWrapper = styled.div<DayBlockWrapperProps>`
  background: rgba(255,255,255,0);
  grid-row: 1;
  grid-column: ${({ column }) => column + 2};
  display: grid;
  grid-template-rows: 3em auto;
`;

/**
 * Displays the name of the day of the week at the top of the DayBlock
 */
const DayBlockHeading = styled.h3<DayBlockHeadingProps>`
  grid-row: 1;
  border: 1px solid #ccc;
  border-bottom: none;
  text-align: center;
  padding-top: 0.5em;
`;

/**
 * An internal grid wihin the DayBlock, into which the SessionBlocks will be
 * placed. For visual consistency, the row height and number of rows should
 * match the WeekBlock.
 */
const DayBlockBody = styled.div<DayBlockBodyProps>`
  display: grid;
  grid-row: 2/ ${({ numRows }) => numRows};
  grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
  grid-template-rows: ${({ numRows, rowHeight }) => (
    `repeat(${numRows - 1}, ${rowHeight})`)};
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: 2px solid #ccc;
`;

/**
 * Defines and entire Day within the week view of our schedule component.
 *
 * The publicly exported component primarily handles props and placement for
 * its subcomponents, the heading and body. The contents of the day, the
 * SessionBlocks, shoudl be defined by the parent component.
 */
const DayBlock: FunctionComponent<DayBlockProps> = ({
  children,
  column,
  heading,
  numRows,
  rowHeight,
}) => (
  <DayBlockWrapper column={column}>
    <DayBlockHeading>
      {heading}
    </DayBlockHeading>
    <DayBlockBody numRows={numRows} rowHeight={rowHeight}>
      {children}
    </DayBlockBody>
  </DayBlockWrapper>
);

declare type DayBlock = ReactElement<DayBlockProps>;

export default DayBlock;
