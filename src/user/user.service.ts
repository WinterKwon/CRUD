import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm/repository/Repository';
import { mariaDataSource } from 'src/app.data.source';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getOne(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return null;
    }
    return user;
  }

  async create(userData: User): Promise<any> {
    const user = await this.userRepository.save(userData);
    if (!user) {
      return { message: 'failed to create a user' };
    }
    return user;
  }

  async updateRefreshToken(email: string, refreshToken: string) {
    const existedUser = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (existedUser) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ refreshToken: refreshToken })
        .where('email = :email', { email: email })
        .execute();
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async update(id: number, userData: User): Promise<void> {
    const existedUser = await this.userRepository.findOneBy({ id });
    if (existedUser) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          ...userData,
        })
        .where('id = :id', { id })
        .execute();
    }
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
