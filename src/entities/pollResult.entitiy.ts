import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PollResult extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0, nullable: true })
  tiger: number;

  @Column({ default: 0, nullable: true })
  hippo: number;

  @Column({ default: 0, nullable: true })
  elephant: number;

  @Column({ default: 0, nullable: true })
  dinosaur: number;

  @Column({ default: 0, nullable: true })
  lion: number;

  @Column({ default: 0, nullable: true })
  pro: number;

  @Column({ default: 0, nullable: true })
  neu: number;

  @Column({ default: 0, nullable: true })
  con: number;
}
