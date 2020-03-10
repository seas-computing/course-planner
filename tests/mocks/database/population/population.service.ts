import {
  Inject, Injectable, OnApplicationBootstrap, BeforeApplicationShutdown,
} from '@nestjs/common';
import { SemesterPopulationService } from './semester.population';
import { AreaPopulationService } from './area.population';


@Injectable()
export class PopulationService implements
  OnApplicationBootstrap,
  BeforeApplicationShutdown {
  @Inject(SemesterPopulationService)
  protected semesterService: SemesterPopulationService;

  @Inject(AreaPopulationService)
  protected areaService: AreaPopulationService;

  public async onApplicationBootstrap(): Promise<void> {
    await this.areaService.populate();
    await this.semesterService.populate();
  }

  public async beforeApplicationShutdown(): Promise<void> {
    await this.areaService.drop();
    await this.semesterService.drop();
  }
}
