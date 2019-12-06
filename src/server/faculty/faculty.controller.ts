import { Controller, Get } from '@nestjs/common';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/manageFaculty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Faculty } from './faculty.entity';

@Controller('faculty')
export class ManageFacultyController {
  @InjectRepository(Faculty)
  private facultyRepository: Repository<Faculty>

  @Get('/')
  @ApiOperation({ title: 'Retrieve all faculty in the database' })
  @ApiOkResponse({
    type: ManageFacultyResponseDTO,
    description: 'An array of all the faculty along with their area',
    isArray: true,
  })
  public async index(): Promise<ManageFacultyResponseDTO[]> {
    const facultyMembers = await this.facultyRepository.find({
      relations: ['area'],
    });
    return facultyMembers.map(({
      category: facultyType,
      ...faculty
    }: Faculty): ManageFacultyResponseDTO => ({
      ...faculty,
      area: {
        // id: faculty.area.id,
        // name: faculty.area.name,
        id: 'fake id',
        name: 'fake name',
      },
      facultyType,
    }));
  }
}
