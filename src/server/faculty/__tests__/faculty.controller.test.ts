import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { strictEqual, deepStrictEqual, rejects } from 'assert';
import { FACULTY_TYPE } from 'common/constants';
import { Authentication } from 'server/auth/authentication.guard';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import * as dummy from 'testData';
import { TimeoutError } from 'rxjs';
import {
  appliedMathFacultyMemberRequest,
  newAreaFacultyMemberResponse,
  appliedMathFacultyMember,
  appliedMathFacultyMemberResponse,
} from 'testData';
import { Semester } from 'server/semester/semester.entity';
import { SemesterService } from 'server/semester/semester.service';
import { toPlainObject } from 'common/__tests__/utils/toPlainObject';
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
      create: stub(),
      findOneOrFail: stub(),
    };

    mockAreaRepository = {
      findOneOrFail: stub(),
      findOne: stub(),
      create: stub(),
      save: stub(),
    };

    mockFacultyRepository = {
      find: stub(),
      save: stub(),
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
    context('when area exists', function () {
      beforeEach(function () {
        mockAreaRepository
          .findOne
          .resolves(appliedMathFacultyMember.area);
        mockAreaRepository.save.resolves(appliedMathFacultyMember.area);
      });
      it('creates a single faculty member', async function () {
        mockFacultyRepository.save.resolves(appliedMathFacultyMember);
        await controller.create(appliedMathFacultyMemberRequest);
        strictEqual(mockFacultyRepository.save.callCount, 1);
      });
      it('returns the newly created faculty member', async function () {
        mockFacultyRepository.save.resolves(appliedMathFacultyMember);
        const newlyCreatedFaculty = await controller
          .create(appliedMathFacultyMemberRequest);
        deepStrictEqual(
          newlyCreatedFaculty,
          appliedMathFacultyMemberResponse
        );
      });
    });
    context('when area does not exist', function () {
      let facultyMember;
      beforeEach(function () {
        mockAreaRepository.findOne.resolves(null);
        mockAreaRepository.save.resolves(newAreaFacultyMemberResponse.area);
        facultyMember = {
          HUID: newAreaFacultyMemberResponse.HUID,
          firstName: newAreaFacultyMemberResponse.firstName,
          lastName: newAreaFacultyMemberResponse.lastName,
          category: newAreaFacultyMemberResponse.category,
          area: newAreaFacultyMemberResponse.area.name,
          jointWith: newAreaFacultyMemberResponse.jointWith,
        };
        mockFacultyRepository.save.resolves({
          ...facultyMember,
          id: newAreaFacultyMemberResponse.id,
        });
      });
      it('returns the newly created faculty member', async function () {
        const newlyCreatedFaculty = await controller.create(facultyMember);
        deepStrictEqual(
          newlyCreatedFaculty,
          newAreaFacultyMemberResponse
        );
      });
      it('saves the new area', async function () {
        await controller.create(facultyMember);
        strictEqual(mockAreaRepository.save.callCount, 1);
      });
    });
  });

  describe('update', function () {
    it('returns the updated faculty member', async function () {
      const newArea = 'NA';
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
      const newArea = 'NA';
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
          where: { name: newArea },
        }));
      await rejects(
        () => controller.update('8636efc3-6b3e-4c44-ba38-4e0e788dba43', newFacultyMemberInfo),
        /entered Area/
      );
    });
    it('throws a Not Found Error if the faculty does not exist', async function () {
      const newArea = 'NA';
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
        area: 'AM',
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
        area: 'NA',
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
