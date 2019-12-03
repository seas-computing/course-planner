import {
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as ActiveRecordBaseEntity,
} from 'typeorm';

/**
 * Base Entity
 *
 * This base entity class is used as the abstract parent of all other entity
 * classes. This enables common table metadata configuration for columns like
 * `id`, `updatedAt`, `createdAt` etc. to be shared consistently across entities
 */
export abstract class BaseEntity extends ActiveRecordBaseEntity {
  /**
   * The primary key record identifier. Used for uniquiely identifying records
   * and for cross-table joins. UUID is used to enable records from different
   * tables to be combined into one dataset without causing ID collisions
   */
  @PrimaryColumn({
    generated: 'uuid',
    type: 'uuid',
  })
  public id: string;

  /**
   * Metadata column used for signifying the date the record was created
   */
  @CreateDateColumn()
  public createdAt: Date;

  /**
   * Metadata column used for signifying the date the record was last updated
   */
  @UpdateDateColumn()
  public updatedAt: Date;
}
