import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { strictEqual, deepStrictEqual } from 'assert';
import { FACULTY_TYPE } from 'common/constants';
import { Authentication } from 'server/auth/authentication.guard';
import { NotFoundException } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { ManageFacultyController } from '../faculty.controller';
import { Faculty } from '../faculty.entity';
import { Area } from '../../area/area.entity';

const mockFacultyRepository = {
  find: stub(),
  save: stub(),
  create: stub(),
  findOneOrFail: stub(),
};

const mockAreaRepository = {
  findOneOrFail: stub(),
};

describe('Faculty controller', function () {
  let controller: ManageFacultyController;

  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockFacultyRepository,
        },
        {
          provide: getRepositoryToken(Area),
          useValue: mockAreaRepository,
        },
      ],
      controllers: [ManageFacultyController],
    }).overrideGuard(Authentication).useValue(true).compile();

    controller = module.get<ManageFacultyController>(ManageFacultyController);
  });
  afterEach(function () {
    Object.values({
      ...mockFacultyRepository,
      ...mockAreaRepository,
    })
      .forEach((sinonStub: SinonStub): void => {
        sinonStub.reset();
      });
  });

  describe('getAll', function () {
    it('returns all faculty in the database', async function () {
      const databaseFaculty = Array(10).fill({
        ...new Faculty(),
        area: new Area(),
      });

      mockFacultyRepository.find.resolves(databaseFaculty);

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
        area: new Area(),
      });

      strictEqual(mockFacultyRepository.create.callCount, 1);
    });
    it('returns the newly created faculty member', async function () {
      const facultyMember = {
        HUID: '12345678',
        firstName: 'Sam',
        lastName: 'Johnston',
        category: FACULTY_TYPE.LADDER,
        area: new Area(),
      };
      mockFacultyRepository.create.resolves({
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
      mockAreaRepository.findOneOrFail.rejects(new EntityNotFoundError(Area, {
        where: { id: newArea.id },
      }));
      try {
        await controller.update('8636efc3-6b3e-4c44-ba38-4e0e788dba43', newFacultyMemberInfo);
      } catch (e) {
        strictEqual(e instanceof NotFoundException, true);
        strictEqual(e.message.message.includes('entered Area'), true);
      }
    });
  });
});
