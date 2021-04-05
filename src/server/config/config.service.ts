import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AUTH_MODE } from 'common/constants';
import { Absence } from 'server/absence/absence.entity';
import { Area } from 'server/area/area.entity';
import { Course } from 'server/course/course.entity';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { CourseInstanceListingView } from 'server/courseInstance/CourseInstanceListingView.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { MultiYearPlanInstanceView } from 'server/courseInstance/MultiYearPlanInstanceView.entity';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import { FacultyScheduleCourseView } from 'server/faculty/FacultyScheduleCourseView.entity';
import { FacultyScheduleSemesterView } from 'server/faculty/FacultyScheduleSemesterView.entity';
import { FacultyScheduleView } from 'server/faculty/FacultyScheduleView.entity';
import { Building } from 'server/location/building.entity';
import { Campus } from 'server/location/campus.entity';
import { Room } from 'server/location/room.entity';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { Meeting } from 'server/meeting/meeting.entity';
import { MeetingListingView } from 'server/meeting/MeetingListingView.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { Semester } from 'server/semester/semester.entity';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { View } from 'server/view/view.entity';
import { NestSessionOptions } from 'nestjs-session';
import { RedisStore } from 'connect-redis';
import { NonClassEventView } from 'server/nonClassEvent/NonClassEvent.view.entity';
import { NonClassParentView } from 'server/nonClassEvent/NonClassParentView.entity';
import LOG_LEVEL from '../../common/constants/logLevels';
import { ScheduleBlockView } from '../courseInstance/ScheduleBlockView.entity';
import { ScheduleEntryView } from '../courseInstance/ScheduleEntryView.entity';
import { RoomBookingInfoView } from '../location/RoomBookingInfoView.entity';

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
   * Return a WHATWG URL object for the CAS URL, thowing an error if CAS_URL is
   * not specified
   *
   * As URL objects are mutable, we should avoid exposing and/or modifying this
   * value directly
   */

  private get casURL(): URL {
    const { CAS_URL } = this.env;
    return new URL(CAS_URL);
  }

  /**
   * Return a WHATWG URL object for the CLIENT URL, thowing an error if
   * CLIENT_URL is not specified
   *
   * As URL objects are mutable, we should avoid exposing and/or modifying this
   * value directly
   */

  private get clientURL(): URL {
    const { CLIENT_URL } = this.env;
    return new URL(CLIENT_URL);
  }

  /**
   * Return a WHATWG URL object for the SERVER URL, thowing an error if
   * SERVER_URL is not specified
   *
   * As URL objects are mutable, we should avoid exposing and/or modifying this
   * value directly
   */

  private get serverURL(): URL {
    const { SERVER_URL } = this.env;
    return new URL(SERVER_URL);
  }

  /**
   * Return the base URL for HarvardKey's cas authentication process
   * Should strip out any auth credentials, query strings and hashes, and remove
   * any trailing slash
   */

  public get casBaseURL(): string {
    const {
      origin,
      pathname,
    } = this.casURL;
    return `${origin}${pathname.slice().replace(/\/$/, '')}`;
  }

  /**
   * Return the /validate endpoint for the application, which will be sent to
   * HarvardKey as the service URL. Should strip out any auth credentials, query
   * strings and hashes, and remove any trailing slash
   */

  public get casServiceURL(): string {
    const {
      origin,
      pathname,
    } = this.serverURL;
    return `${origin}${pathname.slice().replace(/\/$/, '')}/validate`;
  }

  /**
   * Return the base URL for the client application. Used as default return
   * redirect in the auth process. Should strip out any auth credentials, query
   * strings and hashes, and remove any trailing slash
   */

  public get clientBaseURL(): string {
    const {
      origin,
      pathname,
    } = this.clientURL;
    return `${origin}${pathname.slice().replace(/\/$/, '')}`;
  }

  /**
   * Return connection parameters for the TypeORM module
   *
   * The entities property uses a file glob to final all declared entities.
   * Because we're transpiling our code and copying into docker for production,
   * we need to slightly modify the path and extension for our entities.
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
        Course,
        CourseListingView,
        CourseInstance,
        CourseInstanceListingView,
        FacultyCourseInstance,
        MultiYearPlanInstanceView,
        MultiYearPlanView,
        Faculty,
        FacultyListingView,
        FacultyScheduleCourseView,
        FacultyScheduleSemesterView,
        FacultyScheduleView,
        Building,
        Campus,
        Room,
        RoomBookingInfoView,
        RoomListingView,
        Meeting,
        MeetingListingView,
        NonClassEvent,
        NonClassParent,
        ScheduleBlockView,
        ScheduleEntryView,
        NonClassEventView,
        NonClassParentView,
        Semester,
        SemesterView,
        View,
      ],
    };
  }

  /**
   * Return the redis connection string
   * NOTE: This is needed to properly connect to redis over TLS
   */

  public get redisURL(): string {
    const {
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD,
      NODE_ENV,
    } = this.env;
    const redis = new URL(`redis://${REDIS_HOST}:${REDIS_PORT}`);
    if (NODE_ENV === 'production') {
      redis.protocol = 'rediss:';
    }
    if (REDIS_PASSWORD) {
      redis.password = REDIS_PASSWORD;
    }
    return redis.toString();
  }

  /**
   * Return the configuration for the session module
   */

  public getSessionSettings(store: RedisStore): NestSessionOptions {
    const {
      SESSION_SECRET,
    } = this.env;
    const {
      hostname: domain,
      pathname: path,
    } = this.serverURL;
    return {
      session: {
        store,
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        unset: 'destroy',
        cookie: {
          // 12 hours
          maxAge: 1000 * 60 * 60 * 12,
          domain,
          path,
          sameSite: 'strict',
          secure: false,
        },
      },
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
  public get academicYear(): number {
    const now = new Date();
    const calendarYear = now.getFullYear();
    const JUNE = 5;
    const academicYear = now.getMonth() <= JUNE
      ? calendarYear
      : calendarYear + 1;
    return academicYear;
  }

  /**
   * Ensures that the log level in the environment variable is a valid value.
   * If it's not, or if it's undefined, then return `error` as our default.
   */
  public get logLevel(): string {
    const { LOG_LEVEL: logLevel } = this.env;
    if (logLevel
      && Object.values(LOG_LEVEL).includes(logLevel as LOG_LEVEL)) {
      return logLevel;
    }
    console.warn(`"${logLevel}" is not a valid LOG_LEVEL. Defaulting to "error"`);
    return LOG_LEVEL.ERROR;
  }
}

export { ConfigService };
