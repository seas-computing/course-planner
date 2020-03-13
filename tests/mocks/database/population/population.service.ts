import {
  Inject, Injectable, OnApplicationBootstrap, BeforeApplicationShutdown,
} from '@nestjs/common';
import { SemesterPopulationService } from './semester.population';
import { AreaPopulationService } from './area.population';
import { RoomPopulationService } from './room.population';
import { CoursePopulationService } from './course.population';
import { FacultyPopulationService } from './faculty.population';


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


  public async onApplicationBootstrap(): Promise<void> {
    // Area, semester and room can be added in parallel
    await Promise.all([
      this.areaService.populate(),
      this.semesterService.populate(),
      this.roomService.populate(),
    ]);
    // faculty and courses need to be added in series
    await this.facultyService.populate();
    await this.courseService.populate();
  }

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
