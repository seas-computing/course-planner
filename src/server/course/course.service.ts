import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Semester } from 'server/semester/semester.entity';
import { Area } from 'server/area/area.entity';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { IS_SEAS, TERM_PATTERN } from 'common/constants';
import { Course } from './course.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';

/**
 * This type describes the result returned by the findCourses query.
 * It differs from the ManageCourseResponseDTO as it does not have an area object.
 * This avoids the need for a new view just for catalogNumber.
 *
 * By using this interface rather than casting the results to ManageCourseResponseDTO,
 * we ensure that changes to ManageCourseResponseDTO are reflected in the query.
 */
export abstract class FindCoursesQueryResult {
  public id: string;

  public title: string;

  public areaId: string;

  public areaName: string;

  public prefix: string;

  public number: string;

  public catalogNumber: string;

  public termPattern: TERM_PATTERN;

  public isUndergraduate: boolean;

  public isSEAS: IS_SEAS;

  public sameAs: string;

  public private: boolean;
}

@Injectable()
export class CourseService {
  @InjectRepository(Area)
  private areaRepository: Repository<Area>;

  @InjectRepository(Semester)
  private semesterRepository: Repository<Semester>;

  @InjectRepository(Course)
  private courseRepository: Repository<Course>;

  /**
   * Retrieve all courses in the database and sort by:
   * - area ASC
   * - catalogNumber ASC
   */
  public async findCourses(): Promise<ManageCourseResponseDTO[]> {
    // Any changes to this query should be reflected in FindCoursesQueryResult.
    const results: FindCoursesQueryResult[] = await this.courseRepository
      .createQueryBuilder('c')
      .select('c.id', 'id')
      .addSelect('c.title', 'title')
      .addSelect('a.id', 'areaId')
      .addSelect('a.name', 'areaName')
      .addSelect('c.prefix', 'prefix')
      .addSelect('c.number', 'number')
      .addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
      .addSelect('c."termPattern"', 'termPattern')
      .addSelect('c."isUndergraduate"', 'isUndergraduate')
      .addSelect('c."isSEAS"', 'isSEAS')
      .addSelect('c."sameAsId"', 'sameAsId')
      .addSelect("CONCAT_WS(' ', p.prefix, p.number)", 'sameAs')
      .addSelect('c.private', 'private')
      .leftJoinAndSelect(Area, 'a', 'c."areaId" = a.id')
      .leftJoinAndSelect(Course, 'p', 'c."sameAsId" = p.id')
      .orderBy('a.name', 'ASC')
      .addOrderBy('"catalogNumber"', 'ASC')
      .getRawMany();
    return results.map((result) => ({
      id: result.id,
      title: result.title,
      area: {
        id: result.areaId,
        name: result.areaName,
      },
      prefix: result.prefix,
      number: result.number,
      catalogNumber: result.catalogNumber,
      termPattern: result.termPattern,
      isUndergraduate: result.isUndergraduate,
      isSEAS: result.isSEAS,
      sameAs: result.sameAs,
      private: result.private,
    }));
  }

  public async save(course: DeepPartial<Course>): Promise<Course> {
    await this.areaRepository.findOne(course.area.id);

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
