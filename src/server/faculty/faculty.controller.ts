import { Controller, Get } from '@nestjs/common';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/manageFaculty.dto';

@Controller('faculty')
export class ManageFaculty {
  @Get('/')
  public index(): Promise<ManageFacultyResponseDTO[]> {
    return Promise.resolve([]);
  }
}
