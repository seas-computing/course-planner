import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  BaseTheme,
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
import { ThemeContext } from 'styled-components';
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
  const theme: BaseTheme = useContext(ThemeContext);

  useEffect((): void => {
    setFetching(true);
    getMultiYearPlan()
      .then((multiYearPlanList): MultiYearPlanResponseDTO[] => {
        setMultiYearPlan(multiYearPlanList);
        return multiYearPlanList;
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
  }, []);

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
      <TableCell key={semester.id}>
        <TableCellList>
          {semester.instance.faculty.length > 0
            ? semester.instance.faculty.map((faculty): TableCellListItem => (
              <TableCellListItem key={faculty.id}>
                {faculty.displayName}
              </TableCellListItem>
            ))
            : null
          }
        </TableCellList>
      </TableCell>
    ))
  );

  return (
    <div className="multi-year-plan" role="multi-year-plan">
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
                <React.Fragment>
                  {yearsHeaders(multiYearPlan)}
                </React.Fragment>
              </TableRow>
            </TableHead>
            <TableBody isScrollable>
              {multiYearPlan
                .map((course, courseIndex): TableRow => (
                  <TableRow isStriped={courseIndex % 2 === 1} key={course.id}>
                    <TableCell
                      verticalAlignment={VALIGN.TOP}
                      backgroundColor={
                        (course.area
                          && theme.color.area[course.area.toLowerCase()])
                      }
                    >
                      {course.area}
                    </TableCell>
                    <TableRowHeadingCell scope="row">
                      {course.catalogNumber}
                    </TableRowHeadingCell>
                    <TableCell>{course.title}</TableCell>
                    <React.Fragment>
                      {courseInstance(course)}
                    </React.Fragment>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

        )}
    </div>
  );
};

export default MultiYearPlan;
