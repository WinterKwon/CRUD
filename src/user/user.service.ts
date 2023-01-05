import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm/repository/Repository';
import { AddUserDto } from './dto/user.add.user.dto';
import { UpdateUserDto } from './dto/user.update.user.dto';

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
      throw new Error(`can't find such a user`);
    }
    return user;
  }

  async create(userData: AddUserDto): Promise<any> {
    const user = await this.userRepository.save(userData);
    if (!user) {
      // return { message: 'failed to create a user' };
      throw new NotFoundException();
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

  async update(email: string, userData: UpdateUserDto): Promise<User> {
    const existedUser = await this.userRepository.findOneBy({ email });
    if (existedUser) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          ...userData,
        })
        .where('email = :email', { email })
        .execute();
      return await this.userRepository.findOneBy({ email });
    }
    throw new BadRequestException();
  }

  async remove(id: number): Promise<any> {
    const existedUser = await this.userRepository.findOneBy({ id });
    if (!existedUser) {
      throw new Error('could not find such a user');
    }
    await this.userRepository.delete(id);
    return `successfully deleted userID ${id}`;
  }
}
