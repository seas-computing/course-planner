import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Semester } from 'server/semester/semester.entity';
import { Area } from 'server/area/area.entity';
import { IS_SEAS } from 'common/constants';
import { Course } from './course.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';

@Injectable()
export class CourseService {
  @InjectRepository(Area)
  private areaRepository: Repository<Area>;

  @InjectRepository(Semester)
  private semesterRepository: Repository<Semester>;

  @InjectRepository(Course)
  private courseRepository: Repository<Course>;

  public async save(course: DeepPartial<Course>): Promise<Course> {
    await this.areaRepository.findOneOrFail(course.area.id);

    const semesters = await this.semesterRepository.find({});

    return this.courseRepository.save({
      ...course,
      instances: semesters.map((semester: Semester): CourseInstance => ({
        ...new CourseInstance(),
        semester,
      })),
    });
  }

  /**
   * Resolve an array containing all catalog prefixes that currently exist in the
   * database, as strings
   */
  public async getCatalogPrefixList(): Promise<string[]> {
    return this.courseRepository
      .createQueryBuilder('c')
      .select('c.prefix', 'prefix')
      .distinct(true)
      .where(`"isSEAS" <> '${IS_SEAS.N}'`)
      .orderBy('prefix', 'ASC')
      .getRawMany()
      .then(
        // raw result is array of e.g. { prefix: 'CS'} so we are mapping to get
        // an array of prefixes
        (results): string[] => results.map(
          ({ prefix }: {prefix: string}): string => prefix
        )
      );
  }
}
