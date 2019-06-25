import {
  Entity, Column, OneToMany, ObjectType,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Room } from './room.entity';

/**
 * Represents a physical building within a Harvard [[Campus]]. One [[Building]]
 * contains many [[Room]]s.
 */
@Entity()
export class Building extends BaseEntity {
  /**
   * The building name
   *
   * @example `"Maxwell Dworkin"`
   */
  @Column({
    type: 'varchar',
    nullable: false,
    comment: 'The building name (i.e - Maxwell Dworkin)',
  })
  public name: string;

  /**
   * The [[Room]]s within this [[Building]]
   */
  @OneToMany(
    (): ObjectType<Room> => Room,
    ({ building }): Building => building
  )
  public rooms: Room[];
}
