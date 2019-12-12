import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { strictEqual, deepStrictEqual } from 'assert';
import { FACULTY_TYPE } from 'common/constants';
import { ManageFacultyController } from '../faculty.controller';
import { Faculty } from '../faculty.entity';
import { Area } from '../../area/area.entity';

const mockFacultyRepository = {
  find: stub(),
  save: stub(),
  create: stub(),
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
      ],
      controllers: [ManageFacultyController],
    }).compile();

    controller = module.get<ManageFacultyController>(ManageFacultyController);
  });
  afterEach(function () {
    Object.values(mockFacultyRepository)
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
      const facultyMember = {
        HUID: '87654321',
        firstName: 'Ada',
        lastName: 'Lovelace',
        facultyType: FACULTY_TYPE.LADDER,
        area: new Area(),
      };
      mockFacultyRepository.save.resolves({
        ...facultyMember,
        facultyType: FACULTY_TYPE.NON_SEAS_LADDER,
      });
      const {
        facultyType,
      } = await controller.update('a49edd11-0f2d-4d8f-9096-a4062955a11a', facultyMember);

      strictEqual(facultyType, FACULTY_TYPE.NON_SEAS_LADDER);
    });
  });
});
