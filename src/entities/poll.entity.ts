import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Issue } from './issue.entity';

import { User } from './user.entity';

@Entity()
export class Poll extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_at', comment: '이슈의 투표그래프 등록일' })
  pollDate: Date;

  @Column({ default: 0 })
  tiger: number;
  @Column({ default: 0 })
  hippo: number;
  @Column({ default: 0 })
  elephant: number;
  @Column({ default: 0 })
  dinosaur: number;
  @Column({ default: 0 })
  lion: number;

  @Column({ default: 0 })
  pro: number;

  @Column({ default: 0 })
  neu: number;

  @Column({ default: 0 })
  con: number;

  @ManyToOne(() => Issue, (issue) => issue.polls)
  @JoinColumn({ name: 'issue_id' })
  issue: Issue;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  poller: User;
}
