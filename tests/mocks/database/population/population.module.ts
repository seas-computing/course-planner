import { Module } from '@nestjs/common';
import { PopulationService } from './population.service';
import { SemesterPopulationService } from './semester.population';

@Module({
  imports: [
    SemesterPopulationService,
    PopulationService,
  ],
  providers: [
    PopulationService,
  ],
})
export class PopulationModule { }
