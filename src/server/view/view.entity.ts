import {
  Entity, Column,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';

/**
 * An assocication of a user's [[User.eppn]] with a list of columns they wish
 * to have displayed on the administration interface
 */
@Entity()
export class View extends BaseEntity {
  /**
   * A unique identifier that uniquely identifies a [[User]]. Eppn is used here
   * to indicate the owner of a View.
   * @see [[User.eppn]]
   */
  @Column({
    type: 'varchar',
  })
  public eppn: string;

  /**
   * All the column names in this view
   * @example
   * ```js
   * ['classSchedule', 'termPattern']
   * ```
   */
  @Column({
    type: 'varchar',
    array: true,
  })
  public columns: string[] = [];

  /**
   * The name of the view that identifies its purpose to the user.
   */
  @Column({
    type: 'varchar',
  })
  public name: string;
}
