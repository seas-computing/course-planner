import { Module } from '@nestjs/common';
import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultiYearPlanController } from './multiYearPlan.controller';
import { MultiYearPlanService } from './multiYearPlan.service';
import { MultiYearPlanView } from './MultiYearPlanView.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      MultiYearPlanView,
    ]),
  ],
  providers: [
    MultiYearPlanService,
  ],
  controllers: [MultiYearPlanController],
})
export class MultiYearPlanModule { }
