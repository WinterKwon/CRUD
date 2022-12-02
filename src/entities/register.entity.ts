import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Issue } from './issue.entity';

export enum RegisterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Register extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', comment: '이슈가 등록되는 날' })
  registeredDate: Date;

  @Column({ name: 'due_date', comment: '이슈의 등록 마감 기한' })
  dueDate: Date;

  @Column({ default: 0 })
  pros: number;

  @Column({ default: 0 })
  cons: number;
}