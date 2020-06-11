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
  ALIGN,
  LoadSpinner,
  TableRowHeadingCell,
  TableCellList,
  TableCellListItem,
} from 'mark-one';
import { ThemeContext } from 'styled-components';
import {
  MESSAGE_TYPE,
  AppMessage,
  MESSAGE_ACTION,
} from 'client/classes';
import { MessageContext } from 'client/context';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { TableHeadProps } from 'mark-one/lib/Tables/TableHead';
import { getMultiYearPlan } from '../../api/multiYearPlan';

const MultiYearPlan: FunctionComponent = function (): ReactElement {
  const [multiYearPlan, setMultiYearPlan] = useState(
    [] as MultiYearPlanResponseDTO[]
  );
  const [fetching, setFetching] = useState(false);

  const dispatchMessage = useContext(MessageContext);
  const theme: BaseTheme = useContext(ThemeContext);

  /*
  * Sort MultiYearPlanResponse by instances
  *
  const sortmultiYearPlanInstances = (mYP: MultiYearPlanResponseDTO[]):
  MultiYearPlanResponseDTO[] => {
    mYP.map(courseInst => (
      courseInst.instances.sort((a, b) => (
        parseInt(a.calendarYear) - parseInt(b.calendarYear)
          ? parseInt(a.calendarYear) - parseInt(b.calendarYear)
          : parseInt(a.academicYear) - parseInt(b.academicYear)
      ))
    ));
    return (mYP);
  };
  */

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

  const yearsHeaders = (myp) => (
    myp.length > 0
      ? myp[0].instances.map((instance):
        ReactElement<TableHeadProps> => (
          <TableHeadingCell key={instance.id} scope="col">
            {instance.term.slice(0, 1) + '\'' + instance.calendarYear.slice(2, 4) + 'instructors'}
          </TableHeadingCell>
        ))
      : null
  );

  const courseInstance = (course) => (
    course.instances.map((instance):
    ReactElement<TableHeadProps> => (
      <TableCell key={instance.id}>
      <TableCellList>
        {
          instance.faculty.length > 0
            ? instance.faculty.map((f) => (
              <TableCellListItem key={f.id}>
                {f.displayName}
                <br />
              </TableCellListItem>
            ))
            : null
        }
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
              { yearsHeaders(multiYearPlan) }
            </TableRow>
          </TableHead>
          <TableBody isScrollable>
            {multiYearPlan
              .map((course, courseIndex): ReactElement<TableRowProps> => (
                <TableRow isStriped={courseIndex % 2 === 1} key={course.id}>
                  <TableCell
                    alignment={ALIGN.CENTER}
                    backgroundColor={
                      (course.area
                        && theme.color.area[course.area.toLowerCase()])
                        ? theme
                          .color
                          .area[course.area.toLowerCase()]
                        : undefined
                    }
                  >
                    {course.area}
                  </TableCell>
                  <TableRowHeadingCell scope="row"> {course.catalogNumber} </TableRowHeadingCell>
                  <TableCell>{course.title}</TableCell>
                  {courseInstance(course)}
                </TableRow>
              ))}
          </TableBody>
        </Table>

        )}
    </div>
  );

};

export default MultiYearPlan;
