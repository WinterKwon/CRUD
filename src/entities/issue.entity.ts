import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Politician } from './politician.entity';
import { Poll } from './poll.entity';
import { User } from './user.entity';
import { Vote } from './vote.entity';

@Entity()
export class Issue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn({ name: 'created_at', comment: '이슈 생성일' })
  issueDate: Date;

  @Column({ default: true })
  isVoteActive: boolean;

  @Column({ default: false })
  isPollActive: boolean;

  @OneToMany(() => Vote, (vote) => vote.issue)
  votes: Vote[];

  @OneToMany(() => Poll, (poll) => poll.issue)
  polls: Poll[];

  @ManyToOne(() => User, (user) => user.issues)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Politician, (Politician) => Politician.issues, {
    cascade: true,
  })
  @JoinColumn({ name: 'politician_id' })
  politician: Politician;
}
