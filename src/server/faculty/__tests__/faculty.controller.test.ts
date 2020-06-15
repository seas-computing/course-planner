import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { strictEqual, deepStrictEqual, rejects } from 'assert';
import { FACULTY_TYPE } from 'common/constants';
import { Authentication } from 'server/auth/authentication.guard';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import * as dummy from 'testData';
import { Semester } from 'server/semester/semester.entity';
import { SemesterService } from 'server/semester/semester.service';
import { FacultyController } from '../faculty.controller';
import { Faculty } from '../faculty.entity';
import { Area } from '../../area/area.entity';
import { FacultyService } from '../faculty.service';
import { FacultyScheduleService } from '../facultySchedule.service';

describe('Faculty controller', function () {
  let mockFacultyService : Record<string, SinonStub>;
  let mockFacultyScheduleService : Record<string, SinonStub>;
  let mockSemesterService : Record<string, SinonStub>;
  let mockFacultyRepository : Record<string, SinonStub>;
  let mockAreaRepository : Record<string, SinonStub>;

  let mockSemesterRepository : Record<string, SinonStub>;
  let controller: FacultyController;

  beforeEach(async function () {
    mockFacultyService = {
      find: stub(),
    };

    mockFacultyScheduleService = {};

    mockSemesterService = {};

    mockFacultyRepository = {
      find: stub(),
      save: stub(),
      findOneOrFail: stub(),
    };

    mockAreaRepository = {
      findOneOrFail: stub(),
    };

    mockSemesterRepository = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FacultyService,
          useValue: mockFacultyService,
        },
        {
          provide: FacultyScheduleService,
          useValue: mockFacultyScheduleService,
        },
        {
          provide: SemesterService,
          useValue: mockSemesterService,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockFacultyRepository,
        },
        {
          provide: getRepositoryToken(Area),
          useValue: mockAreaRepository,
        },
        {
          provide: getRepositoryToken(Semester),
          useValue: mockSemesterRepository,
        },
      ],
      controllers: [FacultyController],
    }).overrideGuard(Authentication).useValue(true).compile();

    controller = module.get<FacultyController>(FacultyController);
  });

  describe('getAll', function () {
    it('returns all faculty in the database', async function () {
      const databaseFaculty = Array(10).fill(dummy.appliedMathFacultyMember);

      mockFacultyService.find.resolves(databaseFaculty);

      const faculty = await controller.getAll();

      strictEqual(faculty.length, databaseFaculty.length);
    });
  });

  describe('create', function () {
    it('creates a single faculty member', async function () {
      await controller.create({
        HUID: '12345678',
        firstName: 'Sam',
        lastName: 'Johnston',
        category: FACULTY_TYPE.LADDER,
        area: 'AM',
      });

      strictEqual(mockFacultyRepository.save.callCount, 1);
    });
    it('returns the newly created faculty member', async function () {
      const facultyMember = {
        HUID: '12345678',
        firstName: 'Sam',
        lastName: 'Johnston',
        category: FACULTY_TYPE.LADDER,
        area: 'AM',
      };
      mockFacultyRepository.save.resolves({
        ...facultyMember,
        id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
      });
      const {
        id,
        ...newlyCreatedFaculty
      } = await controller.create(facultyMember);

      strictEqual(id, 'a49edd11-0f2d-4d8f-9096-a4062955a11a');
      deepStrictEqual(newlyCreatedFaculty, facultyMember);
    });
  });

  describe('update', function () {
    it('returns the updated faculty member', async function () {
      const newArea = new Area();
      const newFacultyMemberInfo = {
        id: '8636efc3-6b3e-4c44-ba38-4e0e788dba43',
        HUID: '87654321',
        firstName: 'Ada',
        lastName: 'Lovelace',
        category: FACULTY_TYPE.LADDER,
        area: newArea,
      };
      mockFacultyRepository.save.resolves(newFacultyMemberInfo);
      mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
      mockAreaRepository.findOneOrFail.resolves(newArea);
      const updatedFacultyMember = await controller.update('8636efc3-6b3e-4c44-ba38-4e0e788dba43', newFacultyMemberInfo);

      deepStrictEqual(updatedFacultyMember, newFacultyMemberInfo);
    });
    it('throws a Not Found Error if the area does not exist', async function () {
      const newArea = {
        id: 'abc32sdf-84923-fm32-1111-72jshckddiws',
        name: 'Juggling',
      };
      const newFacultyMemberInfo = {
        id: '8636efc3-6b3e-4c44-ba38-4e0e788dba43',
        HUID: '87654321',
        firstName: 'Ada',
        lastName: 'Lovelace',
        category: FACULTY_TYPE.LADDER,
        area: newArea,
      };
      mockAreaRepository
        .findOneOrFail
        .rejects(new EntityNotFoundError(Area, {
          where: { id: newArea.id },
        }));
      await rejects(
        () => controller.update('8636efc3-6b3e-4c44-ba38-4e0e788dba43', newFacultyMemberInfo),
        /entered Area/
      );
    });
    it('throws a Not Found Error if the faculty does not exist', async function () {
      const newArea = new Area();
      const newFacultyMemberInfo = {
        id: '1636efd9-6b3e-4c44-ba38-4e0e788dba54',
        HUID: '87654321',
        firstName: 'Bob',
        lastName: 'Lovelace',
        category: FACULTY_TYPE.LADDER,
        area: newArea,
      };
      mockFacultyRepository
        .findOneOrFail
        .rejects(new EntityNotFoundError(Faculty, {
          where: { id: newFacultyMemberInfo.id },
        }));

      await rejects(
        () => controller.update('1636efd9-6b3e-4c44-ba38-4e0e788dba54', newFacultyMemberInfo),
        /Faculty/
      );
    });
    it('allows other error types to bubble when finding faculty', async function () {
      const newFacultyMemberInfo = {
        id: '1636efd9-6b3e-4c44-ba38-4e0e788dba54',
        HUID: '87654321',
        firstName: 'Bob',
        lastName: 'Lovelace',
        category: FACULTY_TYPE.LADDER,
        area: new Area(),
      };

      mockFacultyRepository
        .findOneOrFail
        .rejects(dummy.error);

      await rejects(
        () => controller.update('1636efd9-6b3e-4c44-ba38-4e0e788dba54', newFacultyMemberInfo),
        dummy.error
      );
    });
    it('allows other error types to bubble when finding area', async function () {
      const newFacultyMemberInfo = {
        id: '1636efd9-6b3e-4c44-ba38-4e0e788dba54',
        HUID: '87654321',
        firstName: 'Bob',
        lastName: 'Lovelace',
        category: FACULTY_TYPE.LADDER,
        area: new Area(),
      };
      mockAreaRepository
        .findOneOrFail
        .rejects(dummy.error);

      await rejects(
        () => controller.update('1636efd9-6b3e-4c44-ba38-4e0e788dba54', newFacultyMemberInfo),
        dummy.error
      );
    });
  });
});
