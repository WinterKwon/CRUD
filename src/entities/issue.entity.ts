import { link } from 'fs';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Politician } from './politician.entity';
import { Poll } from './poll.entity';
import { Register } from './register.entity';
import { User } from './user.entity';

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

  @OneToOne(() => Register, (register) => register.issue)
  @JoinColumn({ name: 'register_id' })
  register: Register;

  @OneToOne(() => Poll, (poll) => poll.issue)
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @ManyToOne(() => Politician)
  @JoinColumn({ name: 'politician_id' })
  politician_id: Politician;
}
