import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Issue } from './issue.entity';
import { User } from './user.entity';

export enum RegisterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  voter: User;

  @ManyToOne(() => Issue, { cascade: true })
  @JoinColumn({ name: 'issue_id' })
  issue: Issue;

  @Column({ default: 0 })
  agree: number;

  @Column({ default: 0 })
  against: number;
}
