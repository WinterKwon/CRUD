import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Issue } from './issue.entity';
import { RegisterProCon } from './registerProCon.entity';
import { EntityRepository } from 'typeorm';
export enum RegisterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  voter: string;

  @Column({ default: 0 })
  for: number;

  @Column({ default: 0 })
  against: number;

  // @OneToOne(() => Issue, (issue) => issue.vote)
  // issue: Issue;
}
