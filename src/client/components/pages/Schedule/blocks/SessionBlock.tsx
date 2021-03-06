import React, { FunctionComponent, ReactElement } from 'react';
import styled from 'styled-components';
import { getCatPrefixColor } from 'common/constants';
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
}

/**
 * Takes the prefix, duration, and startRow props from the SessionBlock
 */
type SessionBlockWrapperProps = Pick<
SessionBlockProps,
'prefix' | 'duration' | 'startRow'
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
  padding-left: 3px;
  padding-right: 3px;
  border-left: 1px solid #fff;
  border-right: 1px solid #fff;
  overflow-wrap: anywhere;
`;

/**
 * The title that appears at the top of the SessionBlock, representing the
 * catalog prefix for all courses during the session
 */
const SessionBlockHeading = styled.h4<SessionBlockHeadingProps>`
  font-size: 1.2em;
  padding: 0px;
  border-bottom: 1px solid rgba(255,255,255,0.5);
  text-transform: uppercase;
`;

/**
 * An unordered list of courses that appear at the same time with the same
 * catalog prefix
 */
const SessionBlockBody = styled.ul<SessionBlockBodyProps>`
  list-style: none;
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
}) => (
  <SessionBlockWrapper
    prefix={prefix}
    startRow={startRow}
    duration={duration}
  >
    <SessionBlockHeading>
      {prefix}
    </SessionBlockHeading>
    <SessionBlockBody>
      {children}
    </SessionBlockBody>
  </SessionBlockWrapper>
);

declare type SessionBlock = ReactElement<SessionBlockProps>;

export default SessionBlock;
