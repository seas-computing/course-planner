import path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { createConnection, getRepository } from 'typeorm';
import { Area } from 'server/area/area.entity';
import { strictEqual, notStrictEqual } from 'assert';
import { Semester } from 'server/semester/semester.entity';
import { Room } from 'server/location/room.entity';
import { Building } from 'server/location/building.entity';
import { Campus } from 'server/location/campus.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { Meeting } from 'server/meeting/meeting.entity';
import { Course } from 'server/course/course.entity';
import { OFFERED } from 'common/constants';
import { PopulationModule } from '../population.module';
import MockDB from '../../MockDB';
import * as testData from '../data';

const entityPathGlob = path.resolve(__dirname, '../../../../../src/server/**/*.entity.ts');

describe('Population Service', function () {
  let testModule: TestingModule;
  let db: MockDB;

  before(async function () {
    // Our test database needs to be set up before any of our tests run
    db = new MockDB();
    await db.init();
  });
  after(async function () {
    // we need to stop the container after test suite finishes, in case any
    // other suites will be using the back end.
    return db.stop();
  });

  describe('Automatic population', function () {
    before(async function () {
      testModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            ...db.connectionOptions,
            synchronize: true,
            autoLoadEntities: true,
            retryAttempts: 10,
            retryDelay: 10000,
            entities: [
              entityPathGlob,
            ],
          }),
          PopulationModule,
        ],
      }).compile();
      // calling init triggers the onApplicationBootstrap hook
      await testModule.createNestApplication().init();
    });
    it('Should populate the area table', async function () {
      const areaRepository = testModule.get(getRepositoryToken(Area));
      const dbAreas = await areaRepository.find();
      strictEqual(dbAreas.length, testData.areas.length);
      testData.areas.forEach(({ name: area }) => {
        const areaIndex = dbAreas.findIndex(({ name }) => name === area);
        notStrictEqual(areaIndex, -1);
      });
    });
    it('Should populate the semesters table', async function () {
      const semesterRepository = testModule.get(getRepositoryToken(Semester));
      const dbSemesters = await semesterRepository.find();
      strictEqual(dbSemesters.length, testData.semesters.length);
      testData.semesters.forEach((semester) => {
        const semesterIndex = dbSemesters
          .findIndex(({ term, academicYear }) => (
            term === semester.term
            && academicYear === semester.academicYear.toString()
          ));
        notStrictEqual(semesterIndex, -1);
      });
    });
    it('Should populate the room table', async function () {
      const roomRepository = testModule.get(getRepositoryToken(Room));
      const dbRooms = await roomRepository.find({
        relations: ['building'],
      });
      strictEqual(dbRooms.length, testData.rooms.length);
      testData.rooms.forEach((room) => {
        const roomIndex = dbRooms
          .findIndex(({ name, building }) => (
            name === room.name
            && building.name === room.building
          ));
        notStrictEqual(roomIndex, -1);
      });
    });
    it('Should populate the building table', async function () {
      const buildingRepository = testModule.get(getRepositoryToken(Building));
      const dbBuildings = await buildingRepository.find({
        relations: ['campus'],
      });
      strictEqual(dbBuildings.length, testData.buildings.length);
      testData.buildings.forEach((building) => {
        const buildingIndex = dbBuildings
          .findIndex(({ name, campus }) => (
            name === building.name
            && campus.name === building.campus
          ));
        notStrictEqual(buildingIndex, -1);
      });
    });
    it('Should populate the campus table', async function () {
      const campusRepository = testModule.get(getRepositoryToken(Campus));
      const dbCampuses = await campusRepository.find();
      strictEqual(dbCampuses.length, testData.campuses.length);
      testData.campuses.forEach(({ name: campus }) => {
        const campusIndex = dbCampuses.findIndex(({ name }) => name === campus);
        notStrictEqual(campusIndex, -1);
      });
    });
    it('Should populate the faculty table', async function () {
      const facultyRepository = testModule.get(getRepositoryToken(Faculty));
      const dbFaculty = await facultyRepository.find();
      strictEqual(dbFaculty.length, testData.faculty.length);
      testData.faculty.forEach((faculty) => {
        const facultyIndex = dbFaculty
          .findIndex(({ HUID }) => HUID === faculty.HUID);
        notStrictEqual(facultyIndex, -1);
      });
    });
    it('Should populate the course table', async function () {
      const courseRepository = testModule.get(getRepositoryToken(Course));
      const dbCourses = await courseRepository.find();
      strictEqual(dbCourses.length, testData.courses.length);
      testData.courses.forEach((course) => {
        const courseIndex = dbCourses
          .findIndex(({ title, prefix, number }) => (
            title === course.title
            && prefix === course.prefix
            && number === course.number
          ));
        notStrictEqual(courseIndex, -1);
      });
    });
    it('Should populate the course_instance table', async function () {
      const courseInstanceRepository = testModule.get(
        getRepositoryToken(CourseInstance)
      );
      const dbInstances = await courseInstanceRepository.find(
        {
          relations: ['course', 'semester'],
        }
      );
      // ensure there's one instance for each semester for each course
      strictEqual(
        dbInstances.length,
        testData.courses.length * testData.semesters.length
      );
      testData.courses.forEach((testCourse) => {
        testData.semesters.forEach((testSemester) => {
          const instanceIndex = dbInstances
            .findIndex(
              ({ course, semester }) => (
                course.title === testCourse.title
                && course.prefix === testCourse.prefix
                && course.number === testCourse.number
                && semester.term === testSemester.term
                && (semester.academicYear
                  === testSemester.academicYear.toString())
              )
            );
          notStrictEqual(instanceIndex, -1);
        });
      });
    });
    it('Should populate the faculty_course_instance_course_instances table', async function () {
      const fciRepository = testModule.get(
        getRepositoryToken(FacultyCourseInstance)
      );
      const dbInstances = await fciRepository.find(
        {
          relations: ['faculty', 'courseInstance', 'courseInstance.course'],
        }
      );
      // For each row in the join table, make sure that the "order" column
      // captures the correct spot in the facultyHUIDs value from the testData
      dbInstances.forEach(({ order, courseInstance, faculty }) => {
        if (courseInstance.offered === OFFERED.Y) {
          const { prefix, number, title } = courseInstance.course;
          const { HUID } = faculty;
          const testCourse = testData.courses.find((course) => (
            course.prefix === prefix
            && course.number === number
            && course.title === title
          ));
          strictEqual(!!testCourse, true);
          strictEqual(testCourse.instances.facultyHUIDs[order], HUID);
        }
      });
    });
    it('Should populate the meeting table', async function () {
      const meetingRepository = testModule.get(
        getRepositoryToken(Meeting)
      );
      const dbMeetings = await meetingRepository.find({
        relations: ['room', 'courseInstance', 'courseInstance.course'],
      });
      // For each row in the meeting table, make sure that the data matches
      // the meeting info from the testData
      dbMeetings.forEach(({
        day, startTime, endTime, courseInstance,
      }) => {
        if (courseInstance.offered === OFFERED.Y) {
          const { prefix, number, title } = courseInstance.course;
          const testCourse = testData.courses.find((course) => (
            course.prefix === prefix
            && course.number === number
            && course.title === title
          ));
          strictEqual(!!testCourse, true);
          const meetingOnDay = testCourse
            .instances
            .meetings
            .find(({ day: mtgDay }) => mtgDay === day);
          strictEqual(!!meetingOnDay, true);
          strictEqual(startTime, meetingOnDay.startTime);
          strictEqual(endTime, meetingOnDay.endTime);
        }
      });
    });
  });
  describe('Automatic depopulation', function () {
    before(async function () {
      // close the module, triggering beforeApplicationShutdown hook
      await testModule.close();
      // Open a direct connection to the db with TypeORM
      return createConnection({
        ...db.connectionOptions,
        synchronize: true,
        entities: [
          entityPathGlob,
        ],
      });
    });
    it('Should truncate the area table', async function () {
      const areaRepository = getRepository(Area);
      const dbAreas = await areaRepository.find();
      strictEqual(dbAreas.length, 0);
    });
    it('Should truncate the semester table', async function () {
      const semesterRepository = getRepository(Semester);
      const dbSemesters = await semesterRepository.find();
      strictEqual(dbSemesters.length, 0);
    });
    it('Should truncate the room table', async function () {
      const roomRepository = getRepository(Room);
      const dbRooms = await roomRepository.find();
      strictEqual(dbRooms.length, 0);
    });
    it('Should truncate the building table', async function () {
      const buildingRepository = getRepository(Building);
      const dbBuildings = await buildingRepository.find();
      strictEqual(dbBuildings.length, 0);
    });
    it('Should truncate the campus table', async function () {
      const campusRepository = getRepository(Campus);
      const dbCampuss = await campusRepository.find();
      strictEqual(dbCampuss.length, 0);
    });
    it('Should truncate the faculty table', async function () {
      const facultyRepository = getRepository(Faculty);
      const dbFaculty = await facultyRepository.find();
      strictEqual(dbFaculty.length, 0);
    });
    it('Should truncate the faculty_course_instance_course_instances table', async function () {
      const fciRepository = getRepository(FacultyCourseInstance);
      const fciInstances = await fciRepository.find();
      strictEqual(fciInstances.length, 0);
    });
    it('Should truncate the course_instance table', async function () {
      const courseInstanceRepository = getRepository(CourseInstance);
      const dbCourseInstances = await courseInstanceRepository.find();
      strictEqual(dbCourseInstances.length, 0);
    });
    it('Should truncate the meeting table', async function () {
      const meetingRepository = getRepository(Meeting);
      const dbMeetings = await meetingRepository.find();
      strictEqual(dbMeetings.length, 0);
    });
    it('Should truncate the course table', async function () {
      const courseRepository = getRepository(Course);
      const dbCourses = await courseRepository.find();
      strictEqual(dbCourses.length, 0);
    });
  });
});
