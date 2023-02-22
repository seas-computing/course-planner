import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { getCatPrefixColor } from 'common/constants';
import { fromTheme } from 'mark-one';
import CourseListing from './CourseListing';

/**
 * Defines the up/down symbols used to indicate that there is scrollable
 * content inside the block.
 */
enum OVERFLOW {
  UP = '⌃',
  DOWN = '⌄',
}

interface SessionBlockProps {
  /**
  * A SessionBlock can only contain one or more CourseListings, representing
  * the individual courses offered at that time.
  */
  children: CourseListing | CourseListing[];

  /**
   * A concatenation of the course prefix and number, which will be displayed
   * as the heading in the Room Schedule blocks.
   */
  catalogNumber?: string;

  /**
   * The catalog prefix shared by the courses in the session, which will be
   * used as the heading in the Schedule blocks.
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
   * The collection of Popover elements corresponding to the buttons in the
   * list. These need to be rendered at the top level of the session block in order
   * to break out of the overflow defined within the body wrapper
   */
  popovers: JSX.Element[];

  /**
   * Whether a popover is currently visible
   */
  isPopoverVisible: boolean;

  /**
   * Whether the sessionblock is faded
   */
  isFaded: boolean;
}

/**
 * Takes a subset of props from the SessionBlock, then adds the additional
 * overflow props
 */
interface SessionBlockWrapperProps extends Pick<
SessionBlockProps,
'prefix' | 'catalogNumber' | 'duration' | 'startRow' | 'isFaded'
> {
  /**
   * Check if there are elements overflowing the bottom of the list
   */
  hasBottomOverflow: boolean;
  /**
   * Check if there are elements overflowing the top of the list
   */
  hasTopOverflow: boolean;
}
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
 * Takes the isPopoverVisible prop from the SessionBlock
 */
 type SessionBlockBodyWrapperProps = Pick<
 SessionBlockProps, 'isPopoverVisible'>;

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
  min-width: 3.5em;
  position: relative;
  opacity: ${({ isFaded }) => (isFaded ? '0.6' : '1')};
 
  ::-webkit-scrollbar {
    width: 0.2em;
    height: 0.2em
}
  ${({ hasBottomOverflow, theme }) => (
    // Show down indicator when there are courses overflowing the bottom
    hasBottomOverflow
      ? `&:after {
         content: '${OVERFLOW.DOWN}';
         position: absolute;
         bottom: ${theme.ws.zero};
         right: ${theme.ws.small};
         color: ${theme.color.text.medium};
      }`
      : null
  )};
  ${({ hasTopOverflow, theme }) => (
    // Show up indicator when there are courses overflowing the top
    hasTopOverflow
      ? `&:before {
         content: '${OVERFLOW.UP}';
         position: absolute;
         top: 2em;
         right: ${theme.ws.small};
         color: ${theme.color.text.medium};
      }`
      : null
  )};
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
const SessionBlockBodyWrapper = styled.div<SessionBlockBodyWrapperProps>`
  overflow-y: hidden;
  position: absolute;
  width: 100%;
  top: 2em;
  bottom: 0;
  border-top: 1px solid rgba(255,255,255,0.5);
  &:hover {
    overflow-y: ${({ isPopoverVisible }): string => (
    isPopoverVisible
      ? 'hidden'
      : 'auto'
  )};
    }
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
  catalogNumber,
  isFaded,
  startRow,
  duration,
  children,
  isPopoverVisible,
  popovers,
}) => {
  /**
   * To be assigned to the inner body wrapper for measuring content overflow
   */
  const bodyWrapperRef = useRef<HTMLDivElement>();

  /**
   * Track whether there are courses outside the visible bounds of the block
   */
  const [
    hasOverflow,
    setHasOverflow,
  ] = useState<Record<'top'|'bottom', boolean>>({
    top: false,
    bottom: false,
  });

  /**
   * Check the bounding rectangle of the inner block body for any overflowing
   * courses
   */
  const checkOverflow = useCallback(() => {
    if (bodyWrapperRef.current) {
      const childListItems = bodyWrapperRef.current.querySelectorAll('li');
      const {
        top: parentTop,
        bottom: parentBottom,
      } = bodyWrapperRef.current.getBoundingClientRect();
      const {
        top: firstChildTop,
      } = (childListItems[0]).getBoundingClientRect();
      const {
        bottom: lastChildBottom,
      } = (childListItems[childListItems.length - 1]).getBoundingClientRect();
      // Use floor/ceiling to correct for fractional placements.
      setHasOverflow({
        top: Math.round(firstChildTop) < Math.round(parentTop),
        bottom: Math.round(lastChildBottom) > Math.round(parentBottom),
      });
    }
  }, []);

  /**
   * Run an initial check for overflows after the schedule content is rendered
   */
  useLayoutEffect(checkOverflow, [checkOverflow, children]);

  return (
    <SessionBlockWrapper
      isFaded={isFaded}
      prefix={prefix}
      catalogNumber={catalogNumber}
      startRow={startRow}
      duration={duration}
      onScroll={checkOverflow}
      hasTopOverflow={hasOverflow.top}
      hasBottomOverflow={hasOverflow.bottom}
    >
      <SessionBlockHeading>
        {catalogNumber || prefix.substr(0, 3)}
      </SessionBlockHeading>
      <SessionBlockBodyWrapper
        isPopoverVisible={isPopoverVisible}
        ref={bodyWrapperRef}
      >
        <SessionBlockBody>
          {children}
        </SessionBlockBody>
      </SessionBlockBodyWrapper>
      {popovers}
    </SessionBlockWrapper>
  );
};

declare type SessionBlock = ReactElement<SessionBlockProps>;

SessionBlock.defaultProps = {
  catalogNumber: '',
};

export default SessionBlock;
