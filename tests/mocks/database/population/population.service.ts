import {
  Inject, Injectable, OnApplicationBootstrap, BeforeApplicationShutdown,
} from '@nestjs/common';
import { SemesterPopulationService } from './semester.population';
import { AreaPopulationService } from './area.population';
import { RoomPopulationService } from './room.population';
import { CoursePopulationService } from './course.population';
import { FacultyPopulationService } from './faculty.population';
import {
  areas,
  semesters,
  buildings,
  campuses,
  rooms,
  faculty,
  courses,
  nonClassParents,
  nonClassEvents,
} from './data';
import { NonClassEventPopulationService } from './nonclassevents.population';

/**
 * Imlements the nestjs lifecycle hooks to automatically populate and
 * depopulate the database whenever the service is injected into a module.
 *
 * WARNING: THIS SERVICE WILL TRUNCATE ALL TABLES AUTOMATICALLY WHEN THE NEST
 * APP STOPS. IT SHOULD ONLY BE INJECTED IN TESTING ENVIRONMENTS.
 */

@Injectable()
export class PopulationService implements
  OnApplicationBootstrap,
  BeforeApplicationShutdown {
  @Inject(SemesterPopulationService)
  protected semesterService: SemesterPopulationService;

  @Inject(AreaPopulationService)
  protected areaService: AreaPopulationService;

  @Inject(RoomPopulationService)
  protected roomService: RoomPopulationService;

  @Inject(FacultyPopulationService)
  protected facultyService: FacultyPopulationService;

  @Inject(CoursePopulationService)
  protected courseService: CoursePopulationService;

  @Inject(NonClassEventPopulationService)
  protected nonClassEventPopulationService: NonClassEventPopulationService;

  /**
   * Calls the necessary populate functions to fill the table with data,
   * resolving when all have finished.
   */
  public async onApplicationBootstrap(): Promise<void> {
    await this.areaService.populate({ areas });
    await this.semesterService.populate({ semesters });
    await this.roomService.populate({ buildings, campuses, rooms });
    await this.facultyService.populate({ faculty });
    await this.courseService.populate({ courses });
    await this.nonClassEventPopulationService.populate({
      parents: nonClassParents,
      events: nonClassEvents,
    });
  }

  /**
   * Calls the necessary drop functions to empty the tables, while maintaining
   * the schemas, after the nest app closes.
   */
  public async beforeApplicationShutdown(): Promise<void> {
    await this.courseService.drop();
    await this.facultyService.drop();
    await this.roomService.drop();
    await this.semesterService.drop();
    await this.areaService.drop();
  }
}
