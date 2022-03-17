import { Injectable, Inject } from '@nestjs/common';
import { Stream } from 'stream';
import Excel from 'exceljs';
import { isSEASEnumToString, offeredEnumToString } from 'common/constants';
import { CourseInstanceService } from '../courseInstance/courseInstance.service';
import CourseInstanceResponseDTO from '../../common/dto/courses/CourseInstanceResponse';

@Injectable()
export class ReportService {
  @Inject(CourseInstanceService)
  private readonly ciService: CourseInstanceService;

  /**
   * Write the course data in xlsx format to a WriteableStream object.
   */
  public async streamCoursesReport(
    xlsxStream: Stream,
    startYear: number,
    endYear: number
  ): Promise<void> {
    const yearRange = Array.from({
      length: (endYear - startYear) + 1,
    },
    (_, index) => startYear + index);
    // Create an object with year keys pointing to lists of courses
    const allCourseData: CourseInstanceResponseDTO[][] = await Promise.all(
      yearRange.map((year) => this.ciService.getAllByYear(year))
    );

    // Create our workbook and sheet
    const coursesReport = new Excel.stream.xlsx.WorkbookWriter({
      stream: xlsxStream,
    });
    const courseSheet = coursesReport.addWorksheet('Courses');

    // Provide addressable column headings for semester/field element
    let courseColumns = [
      { header: 'Area', key: 'area' },
      { header: 'Course Number', key: 'courseNumber' },
      { header: 'Course Title', key: 'courseTitle' },
      { header: 'Is Seas?', key: 'isSEAS' },
      { header: 'Is Undergrad?', key: 'isUndergrad' },
      { header: 'Notes', key: 'notes' },
    ];
    yearRange.forEach((year) => {
      const springYear = year.toString().substr(2);
      const fallYear = (year - 1).toString().substr(2);
      courseColumns = courseColumns.concat([
        { header: `F'${fallYear} Offered`, key: `fall${year}Offered` },
        { header: `F'${fallYear} Instructors`, key: `fall${year}Instructors` },
        { header: `F'${fallYear} Meetings`, key: `fall${year}Meetings` },
        { header: `F'${fallYear} Pre`, key: `fall${year}Pre` },
        { header: `F'${fallYear} Study Card`, key: `fall${year}StudyCard` },
        { header: `F'${fallYear} Actual`, key: `fall${year}Actual` },
        { header: `S'${springYear} Offered`, key: `spring${year}Offered` },
        { header: `S'${springYear} Instructors`, key: `spring${year}Instructors` },
        { header: `S'${springYear} Meetings`, key: `spring${year}Meetings` },
        { header: `S'${springYear} Pre`, key: `spring${year}Pre` },
        { header: `S'${springYear} Study Card`, key: `spring${year}StudyCard` },
        { header: `S'${springYear} Actual`, key: `spring${year}Actual` },
      ]);
    });
    courseSheet.columns = courseColumns;

    // Write information for each course/semester into the sheet
    allCourseData[0].forEach((course, courseIndex) => {
      // Main course data
      const newRow = {
        area: course.area,
        courseNumber: course.catalogNumber,
        courseTitle: course.title,
        isSEAS: isSEASEnumToString(course.isSEAS),
        isUndergrad: course.isUndergraduate ? 'Undergraduate' : 'Graduate',
        notes: course.notes,
      };
      yearRange.forEach((year, yearIndex) => {
        const courseInYear = allCourseData[yearIndex][courseIndex];
        // Fall/Spring semester data
        Object.assign(newRow, {
          [`fall${year}Offered`]: offeredEnumToString(courseInYear.fall.offered),
          [`fall${year}Instructors`]: courseInYear.fall.instructors
            .map(({ displayName }) => displayName)
            .join(',\n'),
          [`fall${year}Meetings`]: courseInYear.fall.meetings
            .map(({
              day, startTime, endTime, room,
            }) => (
              `${day}, ${startTime}-${endTime} (${room.name})`
            )).join(',\n'),
          [`fall${year}Pre`]: courseInYear.fall.preEnrollment,
          [`fall${year}StudyCard`]: courseInYear.fall.studyCardEnrollment,
          [`fall${year}Actual`]: courseInYear.fall.actualEnrollment,
          [`spring${year}Offered`]: offeredEnumToString(courseInYear.spring.offered),
          [`spring${year}Instructors`]: courseInYear.spring.instructors
            .map(({ displayName }) => displayName)
            .join(',\n'),
          [`spring${year}Meetings`]: courseInYear.spring.meetings
            .map(({
              day, startTime, endTime, room,
            }) => (
              `${day}, ${startTime}-${endTime} (${room.name})`
            )).join(',\n'),
          [`spring${year}Pre`]: courseInYear.spring.preEnrollment,
          [`spring${year}StudyCard`]: courseInYear.spring.studyCardEnrollment,
          [`spring${year}Actual`]: courseInYear.spring.actualEnrollment,
        });
      });
      courseSheet.addRow(newRow).commit();
    });
    await coursesReport.commit();
  }
}
