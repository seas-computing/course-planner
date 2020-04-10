import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { ConfigService } from 'server/config/config.service';
import { MultiYearPlanView } from './MultiYearPlanView.entity';

/**
 * @class MultiYearPlanService
 * Injectable service that provides additional methods for querying the
 * database and handling CRUD operations for the Multi Year Plan.
 */

@Injectable()
export class MultiYearPlanService {
  @InjectRepository(MultiYearPlanView)
  private readonly multiYearPlanViewRepository: Repository<MultiYearPlanView>;

  @Inject(ConfigService)
  private readonly configService: ConfigService;


  /**
   * Resolves a list of course instances.
   */
  public async getAllForMultiYearPlan(): Promise<MultiYearPlanResponseDTO[]> {
    // Fetch the current academic year and convert each year to a number
    // so that we can calculate the four year period.
    const academicYear = parseInt(this.configService.academicYear, 10);
    const fourYearList = [0, 1, 2, 3]
      .map((offset): number => offset + academicYear);
    return this.multiYearPlanViewRepository
      .createQueryBuilder('c')
      .where('c.academicYear IN (:...years)', { years: fourYearList })
      .getMany();
  }
}
