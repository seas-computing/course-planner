import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { RedisStoreOptions } from 'connect-redis';
import { AUTH_MODE } from 'common/constants';
import { Absence } from 'server/absence/absence.entity';
import { Area } from 'server/area/area.entity';
import { Building } from 'server/location/building.entity';
import { Campus } from 'server/location/campus.entity';
import { Course } from 'server/course/course.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { CourseInstanceListingView } from 'server/courseInstance/CourseInstanceListingView.entity';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import { Meeting } from 'server/meeting/meeting.entity';
import { MeetingListingView } from 'server/meeting/MeetingListingView.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { Room } from 'server/location/room.entity';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { Semester } from 'server/semester/semester.entity';
import { View } from 'server/view/view.entity';

/**
 * Parses process.env to create a clean configuration interface
 */

class ConfigService {
  private readonly env: { [key: string]: string };

  public constructor(config: { [key: string]: string } = {}) {
    this.env = config;
  }

  /**
   * Return a single value from the environment
   */

  public get(key: string): string {
    return this.env[key];
  }

  /**
   * Return connection parameters for the TypeORM module
   */

  public get dbOptions(): PostgresConnectionOptions {
    const {
      DB_HOSTNAME,
      DB_PORT,
      DB_DATABASE,
      DB_USERNAME,
      DB_PASSWORD,
    } = this.env;
    return {
      type: 'postgres',
      database: DB_DATABASE,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      host: DB_HOSTNAME,
      port: parseInt(DB_PORT),
      entities: [
        Absence,
        Area,
        Building,
        Campus,
        Course,
        CourseInstance,
        CourseInstanceListingView,
        CourseListingView,
        Faculty,
        FacultyCourseInstance,
        FacultyListingView,
        Meeting,
        MeetingListingView,
        NonClassEvent,
        NonClassParent,
        Room,
        RoomListingView,
        Semester,
        View,
      ],
    };
  }

  /**
   * Return connection parameters for the Redis Module
   */

  public get redisOptions(): RedisStoreOptions {
    const {
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD,
      REDIS_PREFIX,
    } = this.env;
    return {
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT),
      pass: REDIS_PASSWORD,
      prefix: REDIS_PREFIX + '_',
    };
  }

  /**
   * check if the app is currently running in production
   */

  public get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  /**
   * check if the app is currently running in development mode
   */

  public get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  /**
   * Determine what kind of authentication should be used
   */
  public get authMode(): AUTH_MODE {
    if (this.isProduction) {
      return AUTH_MODE.HKEY;
    }
    if (this.isDevelopment) {
      return AUTH_MODE.DEV;
    }
    return AUTH_MODE.TEST;
  }

  /**
   * Determine the current academic year based on server time
   *
   * If the date is between Jan 1st and Jun 30th (inclusive),
   * then the academic year is the current calendar year.
   * If the date is between Jul 1st and Dec 31st (inclusive),
   * then the academic year is the next calendar year.
   */
  public get academicYear(): string {
    const now = new Date();
    const calendarYear = now.getFullYear();
    const JUNE = 5;
    const academicYear = now.getMonth() <= JUNE
      ? calendarYear
      : calendarYear + 1;
    return academicYear.toString();
  }
}

export { ConfigService };
