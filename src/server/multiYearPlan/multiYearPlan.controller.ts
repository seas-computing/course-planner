import {
  Controller,
  Get,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUseTags,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Authentication } from 'server/auth/authentication.guard';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { MultiYearPlanService } from './multiYearPlan.service';

@ApiUseTags('Multi Year Plan')
@Controller('api/multi-year-plan')
@ApiForbiddenResponse({
  description: 'The user is not authenticated',
})
@ApiUnauthorizedResponse({
  description: 'The user is authenticated, but lacks the permissions to access this endpoint',
})
@UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
export class MultiYearPlanController {
  @Inject(MultiYearPlanService)
  private readonly multiYearPlanService: MultiYearPlanService;

  @Get('/')
  @ApiOperation({ title: 'Retrieve the multi-year plan' })
  @ApiOkResponse({
    type: MultiYearPlanResponseDTO,
    description: 'An array of all the multi-year plan records',
    isArray: true,
  })
  public async getInstances(): Promise<MultiYearPlanResponseDTO[]> {
    return this.multiYearPlanService.getAllForMultiYearPlan();
  }
}
