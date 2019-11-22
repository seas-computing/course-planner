/**
 * @module Server.DTOS.Courses
 */

abstract class Instance {
  public id: string;

  public offered: string;

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
