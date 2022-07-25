import React, { FunctionComponent, ReactElement } from 'react';
import styled from 'styled-components';
import { getCatPrefixColor } from 'common/constants';
import { fromTheme } from 'mark-one';
import CourseListing from './CourseListing';

interface SessionBlockProps {
  /**
  * A SessionBlock can only contain one or more CourseListings, representing
  * the individual courses offered at that time.
  */
  children: CourseListing | CourseListing[];

  /**
   * The catalog prefix shared by the courses in the session, which will be
   * used as the heading
   */
  prefix: string;

  /**
   * The row within the grid on which the SessionBlock should begin, which
   * corresponds to the start time of the course, scaled to the values of our
   * grid by its parent component
   */
  startRow: number;

  /**
   * The number of rows within the grid that should be covered by the
   * SessionBlock. The parent component should handle any scaling and
   * computation
   */
  duration: number;
  /**
   * Whether the block should be faded out, as when a course in another block
   * has been clicked
   */
  isFaded: boolean;
}

/**
 * Takes the prefix, duration, and startRow props from the SessionBlock
 */
type SessionBlockWrapperProps = Pick<
SessionBlockProps,
'prefix' | 'duration' | 'startRow' | 'isFaded'
>;

/**
 * Takes as children the prefix prop from the SessionBlock
 */
type SessionBlockHeadingProps = {
  children: SessionBlockProps['prefix']
};

/**
 * Takes the children from the SessionBlock
 */
type SessionBlockBodyProps = Pick<SessionBlockProps, 'children'>;

/**
 * The top level of the SessionBlock, which handles setting the placement
 * within the DayBlock grid and the background color
 */
const SessionBlockWrapper = styled.div<SessionBlockWrapperProps>`
  background-color: ${({ prefix }) => getCatPrefixColor(prefix)};
  grid-row: ${({ startRow, duration }) => `${startRow}/ span ${duration}`};
  border-left: 1px solid #fff;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #fff;
  opacity: ${({ isFaded }) => (isFaded ? '0.6' : '1')};
  min-width: 2.5em;
  position: relative;
`;

/**
 * The title that appears at the top of the SessionBlock, representing the
 * catalog prefix for all courses during the session
 */
const SessionBlockHeading = styled.h4<SessionBlockHeadingProps>`
  background-color: inherit;
  position: absolute;
  top: 0;
  width: 100%;
  padding-left: ${fromTheme('ws', 'xsmall')};
  padding-right: ${fromTheme('ws', 'xsmall')};
  font-size: 1.2em;
  text-transform: uppercase;
`;

/**
 * A wrapper around the table to handle scrolling within the list only.
 */
const SessionBlockBodyWrapper = styled.div`
  overflow-y: scroll;
  position: absolute;
  width: 100%;
  top: 2em;
  bottom: 0;
  border-top: 1px solid rgba(255,255,255,0.5);
`;

/**
 * An unordered list of courses that appear at the same time with the same
 * catalog prefix
 */
const SessionBlockBody = styled.ul<SessionBlockBodyProps>`
  list-style: none;
  padding-left: ${fromTheme('ws', 'xsmall')};
  padding-right: ${fromTheme('ws', 'xsmall')};
`;

/**
 * Defines a group of courses that share the same time/day and catalog prefix
 *
 * This publicly exported component mainly handles the placement and props for
 * the individual styled sub-components
 */
const SessionBlock: FunctionComponent<SessionBlockProps> = ({
  prefix,
  startRow,
  duration,
  children,
  isFaded,
}) => (
  <SessionBlockWrapper
    prefix={prefix}
    startRow={startRow}
    duration={duration}
    isFaded={isFaded}
  >
    <SessionBlockHeading>
      {prefix.substr(0, 3)}
    </SessionBlockHeading>
    <SessionBlockBodyWrapper>
      <SessionBlockBody>
        {children}
      </SessionBlockBody>
    </SessionBlockBodyWrapper>
  </SessionBlockWrapper>
);

declare type SessionBlock = ReactElement<SessionBlockProps>;

export default SessionBlock;
