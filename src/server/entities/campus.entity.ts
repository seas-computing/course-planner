import {
  Entity, Column, OneToMany, ObjectType,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Building } from './building.entity';

@Entity()
export class Campus extends BaseEntity {
  /**
   * Campus name
   *
   * @example `"Allston"`
   */
  @Column({
    type: 'varchar',
    comment: 'Campus name (i.e - Allston)',
  })
  public name: string;

  /**
   * A collection of buildings at this campus
   */
  @OneToMany(
    (): ObjectType<Building> => Building,
    ({ campus }): Campus => campus
  )
  public buildings: Building[];
}
