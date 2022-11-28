import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column()
  userName: string;

  @Column()
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

  @Column({ default: ' ', nullable: true })
  tribe: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;
}
