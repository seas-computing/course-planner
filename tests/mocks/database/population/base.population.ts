import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseEntity } from 'server/base/base.entity';

@Injectable()
export abstract class BasePopulationService<E extends BaseEntity> {
  protected repository: Repository<E>;

  public abstract async populate(): Promise<E[]>;

  public async drop(): Promise<void> {
    return this.repository.clear();
  }
}
