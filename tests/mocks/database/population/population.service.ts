import {
  Inject, Injectable, OnApplicationBootstrap, BeforeApplicationShutdown,
} from '@nestjs/common';
import { SemesterPopulationService } from './semester.population';
import { AreaPopulationService } from './area.population';
import { RoomPopulationService } from './room.population';
import { CoursePopulationService } from './course.population';


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

  @Inject(CoursePopulationService)
  protected courseService: CoursePopulationService;

  public async onApplicationBootstrap(): Promise<void> {
    await this.areaService.populate();
    await this.semesterService.populate();
    await this.roomService.populate();
    await this.courseService.populate();
  }

  public async beforeApplicationShutdown(): Promise<void> {
    await this.courseService.drop();
    await this.roomService.drop();
    await this.semesterService.drop();
    await this.areaService.drop();
  }
}
