import React, { FunctionComponent, useState } from 'react';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import DAY, { dayEnumToString } from 'common/constants/day';
import { Popover } from 'mark-one';
import {
  WeekBlock, DayBlock, CourseListing, SessionBlock, CourseListingButton,
} from './blocks';
import { PGTime } from '../../../../common/utils/PGTime';
import { HiddenText } from '../../general';

interface ScheduleViewProps {
  /**
   * The complete course schedule for the currently chosen year/semester. Must
   * be organized by Day, then startTime, then duration, then prefix.
   */
  schedule: ScheduleViewResponseDTO[];

  /**
   * The first hour that should be shown in the schedule
   * This is inclusive; we'll see courses scheduled during this hour
   */
  firstHour: number;

  /**
   * The last hour that should be shown in the schedule
   * This is exclusive; we won't see any courses scheduled during this hour
   */
  lastHour: number;

  /**
   * The number of minutes represented by each row of the grid.
   * The default value of 5 is **strongly** recommended.
   */
  minuteResolution?: 1 | 3 | 5 | 15;

  /**
   * List of the days of the week that should be shown in the schedule.
   * Making this a prop so that we can potentially use it for day-by-day
   * pagination in the future
   */
  days?: string[];

  /**
   * How tall each grid row of the schedule should be. The number of minutes
   * represented by each grid row is controller by the minuteResolution prop
   */
  rowHeight?: string;
}

/**
 * Handles rendering the complete course schedule, setting up the necessary
 * grids for the week and days, then placing in the individual blocks for the
 * different Sessions.
 */
const ScheduleView: FunctionComponent<ScheduleViewProps> = ({
  schedule,
  firstHour,
  lastHour,
  minuteResolution,
  rowHeight,
  days,
}) => {
  // Convert the range of hours covered by our Schedule to a number of
  // css-grid rows
  const numRows = ((lastHour - firstHour) * 60)
      / minuteResolution;

  /**
   * Track the prefix and catalog number of the course whose details should be shown.
   */
  const [currentPopover, setCurrentPopover] = useState('');

  return (
    <WeekBlock
      firstHour={firstHour}
      numRows={numRows}
      numColumns={days.length}
      rowHeight={rowHeight}
      minuteResolution={minuteResolution}
      onClick={() => {
        setCurrentPopover(null);
      }}
    >
      {days.map((day, col) => (
        <DayBlock
          key={day}
          column={col}
          heading={day}
          numRows={numRows}
          rowHeight={rowHeight}
        >
          {schedule
            .reduce<SessionBlock[]>((blocks, {
            id: sessionId,
            coursePrefix,
            startHour,
            startMinute,
            endHour,
            endMinute,
            duration,
            weekday,
            courses,
          }) => {
            if (dayEnumToString(weekday) === day) {
              const resolvedStartRow = Math.round(
              // Convert the start time and duration of the course to a
              // css-grid row
                (((startHour - firstHour) * 60) + startMinute)
                / minuteResolution
                // Add one to account for the header row
              ) + 1;
              const resolvedDuration = Math.round(
                duration / minuteResolution
              );
              return [...blocks, (
                <SessionBlock
                  key={sessionId}
                  prefix={coursePrefix}
                  startRow={resolvedStartRow}
                  duration={resolvedDuration}
                >
                  {courses.map(({
                    id: courseId,
                    courseNumber,
                    room,
                  }) => {
                    const catalogNumber = `${coursePrefix} ${courseNumber}`;
                    const displayStartTime = PGTime.toDisplay(
                      `${startHour}:${startMinute.toString().padStart(2, '0')}`
                    );
                    const displayEndTime = PGTime.toDisplay(
                      `${endHour}:${endMinute.toString().padStart(2, '0')}`
                    );
                    return (
                      <CourseListing key={courseId}>
                        <CourseListingButton
                          aria-hidden
                          onClick={(event) => {
                            event.stopPropagation();
                            setCurrentPopover((current) => (
                              current === courseId ? null : courseId
                            ));
                          }}
                        >
                          {courseNumber}
                        </CourseListingButton>
                        <Popover
                          aria-hidden
                          xOffset="0.5rem"
                          yOffset="1rem"
                          title={catalogNumber}
                          isVisible={currentPopover === courseId}
                        >
                          <p>{day}</p>
                          <p>{`${displayStartTime} - ${displayEndTime}`}</p>
                          <p>{room}</p>
                        </Popover>
                        <HiddenText>
                          {`${catalogNumber} on ${day}, ${displayStartTime} to ${displayEndTime} in ${room}`}
                        </HiddenText>
                      </CourseListing>
                    );
                  })}
                </SessionBlock>
              )];
            }
            return blocks;
          }, [])}
        </DayBlock>
      ))}
    </WeekBlock>
  );
};

ScheduleView.defaultProps = {
  minuteResolution: 5,
  rowHeight: '0.5em',
  days: Object.values(DAY).map(dayEnumToString),
};

export default ScheduleView;
