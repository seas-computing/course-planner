import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUseTags
} from '@nestjs/swagger';
import { FacultyResponseDTO } from 'common/dto/faculty/facultyResponse.dto';
import { CreateFacultyDTO } from 'common/dto/faculty/createFaculty.dto';
import { Faculty } from './faculty.entity';

@ApiUseTags('Faculty')
@Controller('api/faculty')
export class ManageFacultyController {
  @InjectRepository(Faculty)
  private facultyRepository: Repository<Faculty>

  @Get('/')
  @ApiOperation({ title: 'Retrieve all faculty in the database' })
  @ApiOkResponse({
    type: FacultyResponseDTO,
    description: 'An array of all the faculty along with their area',
    isArray: true,
  })
  public async getAll(): Promise<FacultyResponseDTO[]> {
    const facultyMembers = await this.facultyRepository.find({
      relations: ['area'],
    });
    return facultyMembers.map((faculty: Faculty): FacultyResponseDTO => ({
      ...faculty,
      area: {
        id: faculty.area.id,
        name: faculty.area.name,
      },
    }));
  }

  @Post('/')
  @ApiOperation({ title: 'Create a new faculty entry in the database' })
  @ApiOkResponse({
    type: FacultyResponseDTO,
    description: 'An object with the newly created faculty member\'s information.',
    isArray: false,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: the request is not in accordance with the createFaculty DTO',
  })
  public async create(@Body() faculty: CreateFacultyDTO):
  Promise<FacultyResponseDTO> {
    return this.facultyRepository.create({
      HUID: faculty.HUID,
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      category: faculty.category,
      area: faculty.area,
      jointWith: faculty.jointWith,
    });
  }
}
