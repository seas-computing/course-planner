import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/manageFacultyResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CreateFacultyResponseDTO } from 'common/dto/faculty/createFacultyResponse.dto';
import { CreateFacultyDTO } from 'common/dto/faculty/createFaculty.dto';
import { Area } from 'server/area/area.entity';
import { Faculty } from './faculty.entity';

@Controller('api/faculty')
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
  public async getAll(): Promise<ManageFacultyResponseDTO[]> {
    const facultyMembers = await this.facultyRepository.find({
      relations: ['area'],
    });
    return facultyMembers.map(({
      category: facultyType,
      ...faculty
    }: Faculty): ManageFacultyResponseDTO => ({
      ...faculty,
      area: {
        id: faculty.area.id,
        name: faculty.area.name,
      },
      facultyType,
    }));
  }

  @Post('/')
  @ApiOperation({ title: 'Create a new faculty entry in the database' })
  @ApiOkResponse({
    type: CreateFacultyResponseDTO,
    description: 'An object with the newly created faculty member\'s information.',
    isArray: false,
  })
  public async create(@Body() faculty: CreateFacultyDTO):
  Promise<CreateFacultyResponseDTO> {
    return this.facultyRepository.save({
      HUID: faculty.HUID,
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      facultyType: faculty.facultyType,
      area: faculty.area,
      jointWith: faculty.jointWith,
    });
  }
}
