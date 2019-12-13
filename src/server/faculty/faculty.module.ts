import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ManageFacultyController } from './faculty.controller';
import { Faculty } from './faculty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
    ]),
  ],
  controllers: [ManageFacultyController],
  providers: [
  ],
})
export class FacultyModule { }
