import { DAY, OFFERED } from 'common/constants';

/**
 * @module Server.DTOS.Courses
 */

abstract class Instance {
  public id: string;

  public offered: OFFERED;

  public instructors: {
    id: string;
    firstName: string;
    lastName: string;
  }[];

  public times: {
    id: string;
    day: DAY;
    startTime: {
      hour: number;
      minute: number;
    };
    endTime: {
      hour: number;
      minute: number;
    };
  }[];

  public room: {
    id: string;
    name: string;
  };

  public preEnrollment: number;

  public studyCardEnrollment: number;

  public actualEnrollment: number;
}

export default abstract class CourseResponseDTO {
  public id: string;

  public area: string;

  public ccn: string;

  public title: string;

  public sameAs: string;

  public isSEAS: boolean;

  public fall: Instance[] = [];

  public spring: Instance[] = [];

  public notes?: string;

  public detail?: string;
}
