import {
  Inject, Injectable, OnApplicationBootstrap, BeforeApplicationShutdown,
} from '@nestjs/common';
import { SemesterPopulationService } from './semester.population';
import { AreaPopulationService } from './area.population';
import { RoomPopulationService } from './room.population';
import { CoursePopulationService } from './course.population';
import { FacultyPopulationService } from './faculty.population';
import {
  areas, semesters, buildings, campuses, rooms, faculty, courses,
} from './data';

/**
 * Imlements the nestjs lifecycle hooks to automatically populate and 
 * depopulate the database whenever the service is injected into a module.
 *
 * WARNING: THIS SERVICE WILL TRUNCATE ALL TABLES AUTOMATICALLY WHEN THE NEST 
 * APP STOPS. IT SHOULD ONLY BE INJECTED IN TESTING ENVIRONMENTS.
 **/

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

  /**
   * Calls the necessary populate functions to fill the table with data,
   * resolving when all have finished.
   */
  public async onApplicationBootstrap(): Promise<void> {
    // Area, semester and room can be added in parallel
    await Promise.all([
      this.areaService.populate({ areas }),
      this.semesterService.populate({ semesters }),
      this.roomService.populate({ buildings, campuses, rooms }),
    ]);
    // faculty and courses need to be added in series
    await this.facultyService.populate({ faculty });
    await this.courseService.populate({ courses });
  }

  /** 
   * Calls the necessary drop functions to empty the tables, while maintaining
   * the schemas, after the nest app closes.
   **/
  public async beforeApplicationShutdown(): Promise<void> {
    await this.courseService.drop();
    await this.facultyService.drop();
    await Promise.all([
      this.roomService.drop(),
      this.semesterService.drop(),
      this.areaService.drop(),
    ]);
  }
}
