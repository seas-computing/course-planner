import { Injectable, Inject } from '@nestjs/common';
import { Stream } from 'stream';
import Excel from 'exceljs';
import { isSEASEnumToString, offeredEnumToString } from 'common/constants';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { FacultyScheduleService } from 'server/faculty/facultySchedule.service';
import {
  absenceEnumToTitleCase,
  facultyTypeEnumToTitleCase,
} from 'common/utils/facultyHelperFunctions';
import { CourseInstanceService } from '../courseInstance/courseInstance.service';
import CourseInstanceResponseDTO from '../../common/dto/courses/CourseInstanceResponse';
import { formatMeetingForReport, MULTILINE_SEPARATOR } from './utils';

@Injectable()
export class ReportService {
  @Inject(CourseInstanceService)
  private readonly ciService: CourseInstanceService;

  @Inject(FacultyScheduleService)
  private readonly facultyService: FacultyScheduleService;

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

    // Move sameAs information from notes field to sameAs field
    allCourseData[0].forEach((course) => {
      if (course.notes && course.notes.toLowerCase().startsWith('same')) {
        course.sameAs = course.notes;
        course.notes = '';
      }
    });

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
      { header: 'SameAs', key: 'sameAs' },
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
        sameAs: course.sameAs,
      };
      yearRange.forEach((year, yearIndex) => {
        const courseInYear = allCourseData[yearIndex][courseIndex];
        // Fall/Spring semester data
        Object.assign(newRow, {
          [`fall${year}Offered`]: offeredEnumToString(courseInYear.fall.offered),
          [`fall${year}Instructors`]: courseInYear.fall.instructors
            .map(({ displayName }) => displayName)
            .join(MULTILINE_SEPARATOR),
          [`fall${year}Meetings`]: courseInYear.fall.meetings
            .map(formatMeetingForReport)
            .join(MULTILINE_SEPARATOR),
          [`fall${year}Pre`]: courseInYear.fall.preEnrollment,
          [`fall${year}StudyCard`]: courseInYear.fall.studyCardEnrollment,
          [`fall${year}Actual`]: courseInYear.fall.actualEnrollment,
          [`spring${year}Offered`]: offeredEnumToString(courseInYear.spring.offered),
          [`spring${year}Instructors`]: courseInYear.spring.instructors
            .map(({ displayName }) => displayName)
            .join(MULTILINE_SEPARATOR),
          [`spring${year}Meetings`]: courseInYear.spring.meetings
            .map(formatMeetingForReport)
            .join(MULTILINE_SEPARATOR),
          [`spring${year}Pre`]: courseInYear.spring.preEnrollment,
          [`spring${year}StudyCard`]: courseInYear.spring.studyCardEnrollment,
          [`spring${year}Actual`]: courseInYear.spring.actualEnrollment,
        });
      });
      courseSheet.addRow(newRow).commit();
    });
    await coursesReport.commit();
  }

  /**
   * Write the faculty data in xlsx format to a WriteableStream object.
   */
  public async streamFacultyReport(
    xlsxStream: Stream,
    startYear: number,
    endYear: number
  ): Promise<void> {
    const yearList = Array.from({
      length: (endYear - startYear) + 1,
    },
    (_, index) => startYear + index);
    // Create an object with year keys pointing to lists of faculty info
    const yearToFaculty = await this.facultyService.getAllByYear(yearList);
    const facultyToInfoMap: { [id: string]: {
      [year: string]: FacultyResponseDTO } } = {};

    // An intermediary step to organize faculty data such that it's easier to
    // process it in the next step to get the data in the desired format for
    // adding rows to the excel sheet.
    Object.keys(yearToFaculty).forEach((year) => {
      const yearFacultyInfo = yearToFaculty[year];
      yearFacultyInfo.forEach((facultyInfo) => {
        if (!(facultyInfo.id in facultyToInfoMap)) {
          facultyToInfoMap[facultyInfo.id] = {};
        }
        facultyToInfoMap[facultyInfo.id][year] = facultyInfo;
      });
    });

    // Create an array of faculty such that we have the top level faculty
    // information along with a years object that contains a mapping of
    // year-specific absence and course data. This format makes it much
    // easier to map through to create the rows data for the excel sheet.
    const facultyArray = Object.values(facultyToInfoMap).map((years) => {
      const firstFacultyInfo = Object.values(years)[0];
      return {
        area: firstFacultyInfo.area,
        lastName: firstFacultyInfo.lastName,
        firstName: firstFacultyInfo.firstName,
        category: facultyTypeEnumToTitleCase(firstFacultyInfo.category),
        jointWith: firstFacultyInfo.jointWith,
        years,
      };
    });

    // Sort the faculty array by area, last name, and first name to match
    // the sorting of the faculty table.
    facultyArray.sort((a, b) => {
      if (a.area < b.area) return -1;
      if (a.area > b.area) return 1;
      if (a.lastName < b.lastName) return -1;
      if (a.lastName > b.lastName) return 1;
      if (a.firstName < b.firstName) return -1;
      if (a.firstName > b.firstName) return 1;
      return 0;
    });

    // Create our workbook and sheet
    const facultyReport = new Excel.stream.xlsx.WorkbookWriter({
      stream: xlsxStream,
    });
    const facultySheet = facultyReport.addWorksheet('Faculty');

    // Provide addressable column headings for semester/field element
    let facultyColumns = [
      { header: 'Area', key: 'area' },
      { header: 'Last Name', key: 'lastName' },
      { header: 'First Name', key: 'firstName' },
      { header: 'Category', key: 'category' },
      { header: 'Joint With', key: 'jointWith' },
    ];
    yearList.forEach((year) => {
      const springYear = year.toString().substr(2);
      const fallYear = (year - 1).toString().substr(2);
      facultyColumns = facultyColumns.concat([
        { header: `F'${fallYear} Absence`, key: `fall${year}Absence` },
        { header: `F'${fallYear} Courses`, key: `fall${year}Courses` },
        { header: `S'${springYear} Absence`, key: `spring${year}Absence` },
        { header: `S'${springYear} Courses`, key: `spring${year}Courses` },
      ]);
    });
    facultySheet.columns = facultyColumns;

    // Write information for each faculty/semester into the sheet
    facultyArray.forEach((faculty) => {
      // Main faculty data
      const newRow = {
        area: faculty.area,
        lastName: faculty.lastName,
        firstName: faculty.firstName,
        category: faculty.category,
        jointWith: faculty.jointWith,
      };
      yearList.forEach((year) => {
        const facultyInYear = faculty.years[year];
        // Fall/Spring semester data
        Object.assign(newRow, {
          [`fall${year}Absence`]: facultyInYear
            ? absenceEnumToTitleCase(facultyInYear.fall.absence.type)
            : '',
          [`fall${year}Courses`]: facultyInYear
            ? facultyInYear.fall.courses
              .map(({ catalogNumber }) => catalogNumber)
              .join(MULTILINE_SEPARATOR)
            : '',
          [`spring${year}Absence`]: facultyInYear
            ? absenceEnumToTitleCase(facultyInYear.spring.absence.type)
            : '',
          [`spring${year}Courses`]: facultyInYear
            ? facultyInYear.spring.courses
              .map(({ catalogNumber }) => catalogNumber)
              .join(MULTILINE_SEPARATOR)
            : '',
        });
      });
      facultySheet.addRow(newRow).commit();
    });
    await facultyReport.commit();
  }
}
