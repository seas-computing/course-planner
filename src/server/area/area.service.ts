import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './area.entity';

export class AreaService {
  @InjectRepository(Area)
  private readonly areaRepository: Repository<Area>;

  /**
   * Resolve an array containing all areas that currently exist in the
   * database, as strings
   */
  public async getAreaList(): Promise<string[]> {
    return this.areaRepository
      .createQueryBuilder('a')
      .select('a.name', 'name')
      .distinct(true)
      .orderBy('name', 'ASC')
      .getRawMany()
      .then(
        // raw result is array of e.g. { name: 'AM'} so we are mapping to get
        // an array of area names
        (results): string[] => results.map(
          ({ name }: {name: string}): string => name
        )
      );
  }
}
