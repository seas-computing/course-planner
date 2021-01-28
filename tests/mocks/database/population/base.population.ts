import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseEntity } from 'server/base/base.entity';
import { TestData } from './data';
/**
 * Abstract generic class for implementing the various population services
 */

@Injectable()
export abstract class BasePopulationService<E extends BaseEntity> {
  /** The repository associated with the specific Entity */
  protected repository: Repository<E>;

  /**
   * Each Population service will need to provide it's own populate function,
   * since it would be almost impossible to handle testData, relations, etc in
   * a generic way.
   * @param data  A list of data to be entered into the database
   */
  public abstract async populate(
    data: Record<string, TestData[]>
  ): Promise<E[]>;

  /**
   * A generic drop function will simply call clear() (i.e. TRUNCATE) on the
   * specific entity in the Service. However, the clear function does not
   * support the CASCADE option, so this will need to be overwritten if
   * there are relations that need to be cleared.
   */
  public async drop(): Promise<void> {
    return this.repository.clear();
  }
}
