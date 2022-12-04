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

  @Column({ default: RegisterStatus.INACTIVE })
  status: RegisterStatus;

  @OneToOne(() => RegisterProCon)
  regiProCon: RegisterProCon;

  @OneToOne(() => Issue, (issue) => issue.register)
  issue: Issue;
}
