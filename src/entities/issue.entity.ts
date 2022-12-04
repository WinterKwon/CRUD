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

  @OneToOne(() => Register)
  @JoinColumn({ name: 'register_ID' })
  register: Register;

  @OneToOne(() => Poll)
  @JoinColumn({ name: 'poll_ID' })
  poll: Poll;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user_id: User;
}
