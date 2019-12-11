import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { strictEqual } from 'assert';
import { ManageFacultyController } from '../faculty.controller';
import { Faculty } from '../faculty.entity';
import { Area } from '../../area/area.entity';

const mockFacultyRepository = {
  find: stub(),
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
});
