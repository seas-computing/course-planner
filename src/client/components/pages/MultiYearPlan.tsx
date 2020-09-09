import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableCell,
  LoadSpinner,
  TableRowHeadingCell,
  TableCellList,
  TableCellListItem,
  VALIGN,
} from 'mark-one';
import {
  MESSAGE_TYPE,
  AppMessage,
  MESSAGE_ACTION,
} from 'client/classes';
import { MessageContext } from 'client/context';
import {
  MultiYearPlanResponseDTO,
  MultiYearPlanSemester,
} from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { getMultiYearPlan } from '../../api/multiYearPlan';
import { getAreaColor } from '../../../common/constants';

/**
 * The component represents the Multi Year Plan page, which will be rendered at
 * route '/four-year-plan'
 */

const MultiYearPlan: FunctionComponent = (): ReactElement => {
  const [multiYearPlan, setMultiYearPlan] = useState(
    [] as MultiYearPlanResponseDTO[]
  );
  const [fetching, setFetching] = useState(false);

  const dispatchMessage = useContext(MessageContext);

  useEffect((): void => {
    setFetching(true);
    getMultiYearPlan()
      .then((multiYearPlanList) => {
        setMultiYearPlan(multiYearPlanList);
      })
      .catch((): void => {
        dispatchMessage({
          message: new AppMessage('Unable to get MultiYearPlan', MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
      })
      .finally((): void => {
        setFetching(false);
      });
  }, [dispatchMessage]);

  /**
  * yearsHeaders function take the multi year plan list and create
  * a the semesters headers using the semesters in the first of the
  * multi year plan list.
  */

  const yearsHeaders = (myp: MultiYearPlanResponseDTO[]):
  TableHeadingCell[] => (
    myp.length > 0
      ? myp[0].semesters
        .map((semester: MultiYearPlanSemester): TableHeadingCell => (
          <TableHeadingCell key={semester.id} scope="col">
            {`${semester.term[0]}'${semester.calendarYear.slice(2)} Instructors`}
          </TableHeadingCell>
        ))
      : null
  );

  /**
  * courseInstance function take a multi year plan object and fill up the
  * instructors of the object semesters.
  */

  const courseInstance = (course: MultiYearPlanResponseDTO): TableCell[] => (
    course.semesters.map((semester): TableCell => (
      <TableCell verticalAlignment={VALIGN.TOP} key={semester.id}>
        <TableCellList>
          {semester.instance.faculty.length > 0
            ? semester.instance.faculty.map((faculty): TableCellListItem => (
              <TableCellListItem key={faculty.id}>
                {faculty.displayName}
              </TableCellListItem>
            ))
            : null}
        </TableCellList>
      </TableCell>
    ))
  );

  return (
    <div className="multi-year-plan">
      {fetching
        ? (
          <div>
            <LoadSpinner>Fetching Course Data</LoadSpinner>
          </div>
        )
        : (
          <Table>
            <TableHead>
              <TableRow isStriped>
                <TableHeadingCell scope="col">Area</TableHeadingCell>
                <TableHeadingCell scope="col">CatalogNumber</TableHeadingCell>
                <TableHeadingCell scope="col">Title</TableHeadingCell>
                <>
                  {yearsHeaders(multiYearPlan)}
                </>
              </TableRow>
            </TableHead>
            <TableBody isScrollable>
              {multiYearPlan
                .map((course, courseIndex): TableRow => (
                  <TableRow isStriped={courseIndex % 2 === 1} key={course.id}>
                    <TableCell
                      verticalAlignment={VALIGN.TOP}
                      backgroundColor={getAreaColor(course.area)}
                    >
                      {course.area}
                    </TableCell>
                    <TableRowHeadingCell verticalAlignment={VALIGN.TOP} scope="row">
                      {course.catalogNumber}
                    </TableRowHeadingCell>
                    <TableCell verticalAlignment={VALIGN.TOP}>
                      {course.title}
                    </TableCell>
                    <>
                      {courseInstance(course)}
                    </>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

        )}
    </div>
  );
};

export default MultiYearPlan;
