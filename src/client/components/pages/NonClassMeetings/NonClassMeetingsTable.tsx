import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadingCell,
  TableCell,
  TableHeadingSpacer,
  TableCellList,
  TableCellListItem,
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import NonClassMeetingResponseDTO from 'common/dto/nonClassMeetings/NonClassMeeting.dto';
import { getAreaColor } from 'common/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { dayEnumToString } from 'common/constants/day';
import { MeetingGrid, MeetingGridSection } from 'client/components/pages/Courses/tableFields';
import { CampusIcon, CellLayout } from 'client/components/general';
import { PGTime } from '../../../../common/utils/PGTime';

interface NonClassMeetingsTableProps {
  /**
   * The list of entries to be shown in the table
   */
  nonClassMeetingList: NonClassMeetingResponseDTO[];
  /**
   * The Academic Year of the data currently being displayed
   */
  academicYear: number;
}

/**
 * Component representing the list of non-class meetings in a given academic year
 */
const NonClassMeetingsTable: FunctionComponent<NonClassMeetingsTableProps> = ({
  academicYear,
  nonClassMeetingList,
}): ReactElement => (
  <Table>
    <TableHead>
      <TableRow noHighlight>
        <TableHeadingSpacer colSpan={5} />
        <TableHeadingCell
          backgroundColor="transparent"
          colSpan="1"
          scope="colgroup"
        >
          Fall
          {' ' + (academicYear - 1).toString()}
        </TableHeadingCell>
        <TableHeadingCell
          backgroundColor="transparent"
          colSpan="1"
          scope="colgroup"
        >
          Spring
          {' ' + academicYear.toString()}
        </TableHeadingCell>
      </TableRow>
      <TableRow isStriped>
        <TableHeadingCell>Area</TableHeadingCell>
        <TableHeadingCell>Title</TableHeadingCell>
        <TableHeadingCell>Expected Size</TableHeadingCell>
        <TableHeadingCell>Notes</TableHeadingCell>
        <TableHeadingCell>Contact Info</TableHeadingCell>
        <TableHeadingCell>Room</TableHeadingCell>
        <TableHeadingCell>Room</TableHeadingCell>
        <TableHeadingCell>Edit Meeting</TableHeadingCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {
        nonClassMeetingList.map(({
          id,
          area,
          title,
          expectedSize,
          notes,
          contactEmail,
          contactName,
          contactPhone,
          spring,
          fall,
        }, index) => (
          <TableRow isStriped={index % 2 !== 0} key={id}>
            <TableCell backgroundColor={getAreaColor(area)}>{area}</TableCell>
            <TableCell>{title}</TableCell>
            <TableCell>{expectedSize}</TableCell>
            <TableCell>{notes}</TableCell>
            <TableCell>
              {
                /*
                  * This is being used instead of just outputting the fields
                  * directly as a way to filter out any null values. This
                  * ensures that if a phone number, name or email is missing
                  * we don't end up with blank lines where the "<br />"s still
                  * are, but with no data before them.
                  *
                  * The same result could be accomplished with lots of ternary
                  * logic, but this felt like a cleaner (and more scalable) way
                  * to solve the problem.
                  */
                [
                  contactName,
                  contactEmail,
                  contactPhone,
                ]
                  .filter((info) => !!info)
                  .map((info) => (<p key={info}>{info}</p>))
              }
            </TableCell>
            <TableCell>
              <CellLayout>
                <TableCellList>
                  {fall.meetings.map(({
                    id: meetingId,
                    day,
                    startTime,
                    endTime,
                    room,
                  }) => (
                    <TableCellListItem key={meetingId}>
                      <MeetingGrid>
                        <MeetingGridSection area="time">
                          <div>{dayEnumToString(day)}</div>
                          <div>{`${PGTime.toDisplay(startTime)} - ${PGTime.toDisplay(endTime)}`}</div>
                        </MeetingGridSection>
                        {room && (
                          <>
                            <MeetingGridSection area="room">
                              {room.name}
                            </MeetingGridSection>
                            <MeetingGridSection area="campus">
                              <CampusIcon>{room.campus}</CampusIcon>
                            </MeetingGridSection>
                          </>
                        )}
                      </MeetingGrid>
                    </TableCellListItem>
                  ))}
                </TableCellList>
                <BorderlessButton
                  alt={`Edit fall ${academicYear} meetings for ${title}`}
                  onClick={() => {}}
                  variant={VARIANT.INFO}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </BorderlessButton>
              </CellLayout>
            </TableCell>
            <TableCell>
              <CellLayout>
                <TableCellList>
                  {spring.meetings.map(({
                    id: meetingId,
                    day,
                    startTime,
                    endTime,
                    room,
                  }) => (
                    <TableCellListItem key={meetingId}>
                      <MeetingGrid>
                        <MeetingGridSection area="time">
                          <div>{dayEnumToString(day)}</div>
                          <div>{`${PGTime.toDisplay(startTime)} - ${PGTime.toDisplay(endTime)}`}</div>
                        </MeetingGridSection>
                        {room && (
                          <>
                            <MeetingGridSection area="room">
                              {room.name}
                            </MeetingGridSection>
                            <MeetingGridSection area="campus">
                              <CampusIcon>{room.campus}</CampusIcon>
                            </MeetingGridSection>
                          </>
                        )}
                      </MeetingGrid>
                    </TableCellListItem>
                  ))}
                </TableCellList>
                <BorderlessButton
                  alt={`Edit spring ${academicYear} meetings for ${title}`}
                  onClick={() => {}}
                  variant={VARIANT.INFO}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </BorderlessButton>
              </CellLayout>
            </TableCell>
            <TableCell>
              <BorderlessButton
                onClick={() => {}}
                variant={VARIANT.INFO}
                alt={`Edit ${title}`}
              >
                <FontAwesomeIcon icon={faEdit} />
              </BorderlessButton>
            </TableCell>
          </TableRow>
        ))
      }
    </TableBody>
  </Table>
);

export default NonClassMeetingsTable;
