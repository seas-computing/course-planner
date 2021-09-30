import { TestingModule, Test } from '@nestjs/testing';
import { Course } from 'server/course/course.entity';
import { Repository } from 'typeorm';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { Area } from 'server/area/area.entity';
import { strictEqual } from 'assert';
import { CourseModule } from 'server/course/course.module';
import { AuthModule } from '../../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { AUTH_MODE } from '../../../../src/common/constants';

describe('Course Entity', function () {
  let courseRepository: Repository<Course>;
  let testCourse: Course;
  let savedCourse: Course;
  let testModule: TestingModule;

  beforeEach(async function () {
    testModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (
            config: ConfigService
          ): TypeOrmModuleOptions => ({
            ...config.dbOptions,
            synchronize: true,
            retryAttempts: 10,
            retryDelay: 10000,
          }),
          inject: [ConfigService],
        }),
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
        CourseModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();

    courseRepository = testModule.get(getRepositoryToken(Course));
    await testModule.createNestApplication().init();
  });

  afterEach(async function () {
    await testModule.close();
  });
  describe('Entity Listeners', function () {
    beforeEach(function () {
      const testArea = new Area();
      testArea.name = 'CS';
      testCourse = courseRepository.create({
        area: testArea,
        prefix: 'CS',
        title: 'Testing Course',
        number: '109a',
      });
    });
    describe('BeforeInsert', function () {
      let numberAlphabetical: string;
      let numberInteger: number;
      context('When a course number has alpha and numeric portions', function () {
        beforeEach(async function () {
          savedCourse = await courseRepository.save(testCourse);
          ({
            numberInteger,
            numberAlphabetical,
          } = await courseRepository.findOne(
            savedCourse.id,
            {
              select: [
                'id',
                'numberInteger',
                'numberAlphabetical',
              ],
            }
          ));
        });
        it('Should populate the numberInteger field', function () {
          strictEqual(numberInteger, 109);
        });
        it('Should populate the numberAlphabetical field', function () {
          strictEqual(numberAlphabetical, 'a');
        });
      });
      context('When a course number has only numeric portions', function () {
        beforeEach(async function () {
          testCourse = Object.assign(testCourse, {
            number: '50',
          });
          savedCourse = await courseRepository.save(testCourse);
          ({
            numberInteger,
            numberAlphabetical,
          } = await courseRepository.findOne(
            savedCourse.id,
            {
              select: [
                'id',
                'numberInteger',
                'numberAlphabetical',
              ],
            }
          ));
        });
        it('Should populate the numberInteger field', function () {
          strictEqual(numberInteger, 50);
        });
        it('Should set the numberAlphabetical field to null', function () {
          strictEqual(numberAlphabetical, null);
        });
      });
      context('When a course number has only alpha portions', function () {
        beforeEach(async function () {
          testCourse = Object.assign(testCourse, {
            number: 'XXX',
          });
          savedCourse = await courseRepository.save(testCourse);
          ({
            numberInteger,
            numberAlphabetical,
          } = await courseRepository.findOne(
            savedCourse.id,
            {
              select: [
                'id',
                'numberInteger',
                'numberAlphabetical',
              ],
            }
          ));
        });
        it('Should set the numberInteger field to null', function () {
          strictEqual(numberInteger, null);
        });
        it('Should populate the numberAlphabetical field', function () {
          strictEqual(numberAlphabetical, 'XXX');
        });
      });
      context('When a course number is all special characters', function () {
        beforeEach(async function () {
          testCourse = Object.assign(testCourse, {
            number: '???',
          });
          savedCourse = await courseRepository.save(testCourse);
          ({
            numberInteger,
            numberAlphabetical,
          } = await courseRepository.findOne(
            savedCourse.id,
            {
              select: [
                'id',
                'numberInteger',
                'numberAlphabetical',
              ],
            }
          ));
        });
        it('Should set the numberInteger field to null', function () {
          strictEqual(numberInteger, null);
        });
        it('Should set the numberAlphabetical field to null', function () {
          strictEqual(numberAlphabetical, null);
        });
      });
      context('When a course number is an empty string', function () {
        beforeEach(async function () {
          testCourse = Object.assign(testCourse, {
            number: '',
          });
          savedCourse = await courseRepository.save(testCourse);
          ({
            numberInteger,
            numberAlphabetical,
          } = await courseRepository.findOne(
            savedCourse.id,
            {
              select: [
                'id',
                'numberInteger',
                'numberAlphabetical',
              ],
            }
          ));
        });
        it('Should set the numberInteger field to null', function () {
          strictEqual(numberInteger, null);
        });
        it('Should set the numberAlphabetical field to null', function () {
          strictEqual(numberAlphabetical, null);
        });
      });
    });
    describe('BeforeUpdate', function () {
      let numberAlphabetical: string;
      let numberInteger: number;
      beforeEach(async function () {
        savedCourse = await courseRepository.save(testCourse);
      });
      context('When the course number changes', function () {
        context('When the new course number has alpha and numeric portions', function () {
          beforeEach(async function () {
            savedCourse.number = '91r';
            await courseRepository.save(savedCourse);
            const savedUpdatedCourse = await courseRepository.findOne(
              savedCourse.id,
              {
                select: [
                  'id',
                  'numberInteger',
                  'numberAlphabetical',
                ],
              }
            );
            ({
              numberInteger,
              numberAlphabetical,
            } = savedUpdatedCourse);
          });
          it('Should populate the numberInteger field', function () {
            strictEqual(numberInteger, 91);
          });
          it('Should populate the numberAlphabetical field', function () {
            strictEqual(numberAlphabetical, 'r');
          });
        });
        context('When the new course number has only numeric portions', function () {
          beforeEach(async function () {
            savedCourse.number = '50';
            await courseRepository.save(savedCourse);
            const savedUpdatedCourse = await courseRepository.findOne(
              savedCourse.id,
              {
                select: [
                  'id',
                  'numberInteger',
                  'numberAlphabetical',
                ],
              }
            );
            ({
              numberInteger,
              numberAlphabetical,
            } = savedUpdatedCourse);
          });
          it('Should populate the numberInteger field', function () {
            strictEqual(numberInteger, 50);
          });
          it('Should set the numberAlphabetical field to null', function () {
            strictEqual(numberAlphabetical, null);
          });
        });
        context('When the new course number has only alpha portions', function () {
          beforeEach(async function () {
            savedCourse.number = 'XXX';
            await courseRepository.save(savedCourse);
            const savedUpdatedCourse = await courseRepository.findOne(
              savedCourse.id,
              {
                select: [
                  'id',
                  'numberInteger',
                  'numberAlphabetical',
                ],
              }
            );
            ({
              numberInteger,
              numberAlphabetical,
            } = savedUpdatedCourse);
          });
          it('Should set the numberInteger field to null', function () {
            strictEqual(numberInteger, null);
          });
          it('Should populate the numberAlphabetical field', function () {
            strictEqual(numberAlphabetical, 'XXX');
          });
        });
        context('When the new course number has only special character', function () {
          beforeEach(async function () {
            savedCourse.number = '???';
            await courseRepository.save(savedCourse);
            const savedUpdatedCourse = await courseRepository.findOne(
              savedCourse.id,
              {
                select: [
                  'id',
                  'numberInteger',
                  'numberAlphabetical',
                ],
              }
            );
            ({
              numberInteger,
              numberAlphabetical,
            } = savedUpdatedCourse);
          });
          it('Should set the numberInteger field to null', function () {
            strictEqual(numberInteger, null);
          });
          it('Should set the numberAlphabetical field to null', function () {
            strictEqual(numberAlphabetical, null);
          });
        });
        context('When the new course number is an empty string', function () {
          beforeEach(async function () {
            savedCourse.number = '';
            await courseRepository.save(savedCourse);
            const savedUpdatedCourse = await courseRepository.findOne(
              savedCourse.id,
              {
                select: [
                  'id',
                  'numberInteger',
                  'numberAlphabetical',
                ],
              }
            );
            ({
              numberInteger,
              numberAlphabetical,
            } = savedUpdatedCourse);
          });
          it('Should set the numberInteger field to null', function () {
            strictEqual(numberInteger, null);
          });
          it('Should set the numberAlphabetical field to null', function () {
            strictEqual(numberAlphabetical, null);
          });
        });
      });
      context('When the course number does not change', function () {
        let title: string;
        beforeEach(async function () {
          savedCourse.title = 'Updated Course';
          await courseRepository.save(savedCourse);
          const savedUpdatedCourse = await courseRepository.findOne(
            savedCourse.id,
            {
              select: [
                'id',
                'title',
                'numberInteger',
                'numberAlphabetical',
              ],
            }
          );
          ({
            numberInteger,
            numberAlphabetical,
            title,
          } = savedUpdatedCourse);
        });
        it('Should update the fields that changed', function () {
          strictEqual(title, 'Updated Course');
        });
        it('Should not change the numberInteger field', function () {
          strictEqual(numberInteger, 109);
        });
        it('Should not change the numberAlphabetical field', function () {
          strictEqual(numberAlphabetical, 'a');
        });
      });
    });
  });
});
