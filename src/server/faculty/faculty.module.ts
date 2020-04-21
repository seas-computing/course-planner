import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ManageFacultyController } from './faculty.controller';
import { Faculty } from './faculty.entity';
import { Area } from '../area/area.entity';
import { MultiYearPlanFacultyListingView } from '../courseInstance/MultiYearPlanFacultyListingView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
      Area,
    ]),
  ],
  controllers: [ManageFacultyController],
  providers: [
    MultiYearPlanFacultyListingView,
  ],
})
export class FacultyModule { }
