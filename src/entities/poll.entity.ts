import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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
}
