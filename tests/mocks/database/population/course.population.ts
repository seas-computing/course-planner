import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TERM_PATTERN } from 'common/constants';
import { BasePopulationService } from './base.population';
import { courses } from './data';

export class CoursePopulationService extends BasePopulationService<Course> {
  @InjectRepository(Course)
  protected Repository: Repository<Course>;

  @InjectRepository(Area)
  protected areaRepository: Repository<Area>;

  public async populate() {
    const areas = await this.areaRepository.find(
      {
        order: {
          name: 'ASC',
        },
      }
    );
    const prefixes = [
      'AC',
      'AM',
      'AP',
      'BE',
      'CS',
      'EE',
      'ESE',
      'MSME',
      'MDE',
      'MSMBA',
      'SEM',
      'GEN',
    ];
    const randomTitle = (): string => {
      const level = ['Introduction to', 'Advanced', 'Topics in', 'Extreme'];
      const adjective = ['Data', 'Computational', 'Mechanical', 'Scientific'];
      const subject = ['Science', 'Computation', 'Engineering', 'Biology', 'Physics'];
      return [
        level[Math.floor(Math.random() * level.length)],
        adjective[Math.floor(Math.random() * adjective.length)],
        subject[Math.floor(Math.random() * subject.length)],
      ].join(' ');
    };
    return this.repository.save(
      areas.reduce(
        (list: Course[], area: Area): Course[] => list.concat(
          Array(4).map((): Course => {
            const course = new Course();
            course.title = randomTitle();
            course.prefix = prefixes[
              Math.floor(Math.random() * prefixes.length)
            ];
            course.number = (Math.ceil(Math.random() * 400)).toString();
            if (Math.random() > 0.75) {
              course.number += ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
            }
            course.isUndergraduate = Math.random() > 0.5;
            course.notes = '';
            course.area = area;
            course.private = Math.random() > 0.5;
            course.sameAs = '';
            course.termPattern = Object.values(TERM_PATTERN)[
              Math.floor(Math.random() * Object.values(TERM_PATTERN).length)
            ];
            course.isSEAS = Math.random() > 0.5;
            return course;
          })
        ), [] as Course[]
      )
    );
  }
}
