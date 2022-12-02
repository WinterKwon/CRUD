import { link } from 'fs';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
