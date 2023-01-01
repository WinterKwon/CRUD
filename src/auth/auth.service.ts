import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string): Promise<any> {
    const user = await this.userService.getOne(email);
    if (!user) {
      return null;
    }
    return user;
  }

  async addUser(userData: any): Promise<object> {
    const user = await this.userService.create(userData);
    if (!user) {
      return { message: 'failed to create user' };
    }
    return { message: 'created successfully', user };
  }

  createLoginToken(user: User) {
    const payload = {
      email: user.email,
      userToken: 'loginToken',
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '72h',
    });
  }

  async createRefreshToken(user: User) {
    const payload = {
      email: user.email,
      userToken: 'refreshToken',
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '240h',
    });

    const refreshToken = CryptoJS.AES.encrypt(
      JSON.stringify(token),
      process.env.AES_KEY,
    ).toString();

    await this.userService.updateRefreshToken(user.email, refreshToken);
    return refreshToken;
  }

  async onceToken(userProfile) {
    const payload = {
      email: userProfile.email,
      userToken: 'oncetoken',
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '60m',
    });
  }

  async validateToken(token: string) {
    const result = await this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
    if (!result) {
      return { message: 'failed to verify token' };
    }
    return result;
  }
}
