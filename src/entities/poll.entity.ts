import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Issue } from './issue.entity';
import { PollResult } from './pollResult.entitiy';

@Entity()
export class Poll extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', comment: '이슈의 투표그래프 등록일' })
  pollDate: Date;

  @Column()
  pollDueDate: Date;

  @Column({ default: true })
  isPollActive: boolean;

  @OneToOne(() => Issue, (issue) => issue.poll)
  issue: Issue;

  @OneToOne(() => PollResult)
  pollResult: PollResult;
}
