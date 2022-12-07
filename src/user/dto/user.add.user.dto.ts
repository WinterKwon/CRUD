import { IsEmail, IsEnum, IsNumber, IsOptional } from 'class-validator';

enum UserRole {
  ADMIN = 'admin',
  BASIC_USER = 'basic',
  GHOST = 'ghost',
}

enum UserStatus {
  NORMAL = 'normal',
  EXPIRED = 'expired',
  EXPELLED = 'expelled',
}

enum UserTribe {
  TIGER = 'tiger',
  HIPPO = 'hippo',
  ELEPHANT = 'elephant',
  DINOSAUR = 'dinosaur',
  LION = 'lion',
}

export class AddUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  userName?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsEnum(UserTribe)
  tribe: UserTribe;

  @IsOptional()
  @IsEnum(UserStatus)
  userStatus: UserStatus;

  @IsOptional()
  refreshToken: string;
}
