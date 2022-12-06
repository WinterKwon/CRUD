import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Issue } from './issue.entity';

export enum UserRole {
  ADMIN = 'admin',
  BASIC_USER = 'basic',
  GHOST = 'ghost',
}

export enum UserStatus {
  NORMAL = 'normal',
  EXPIRED = 'expired',
  EXPELLED = 'expelled',
}

export enum UserTribe {
  TIGER = 'tiger',
  HIPPO = 'hippo',
  ELEPHANT = 'elephant',
  DINOSAUR = 'dinosaur',
  LION = 'lion',
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BASIC_USER,
    nullable: true,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.NORMAL,
    nullable: true,
  })
  userStatus: UserStatus;

  @Column({ nullable: true })
  tribe: UserTribe;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @OneToMany(() => Issue, (issue) => issue.user_id)
  issues: Issue[];
}
