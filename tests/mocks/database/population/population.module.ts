import { Module } from '@nestjs/common';
import { SemesterPopulationService } from './semester.population';

@Module({
  imports: [
    SemesterPopulationService,
  ],
  exports: [
    SemesterPopulationService,
  ],
})
export class PopulationModule { }
