import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAll(@Res() response): Promise<User[]> {
    try {
      const users = await this.userService.getAllUsers();
      return response.status(HttpStatus.OK).json({
        message: 'found successfully',
        users,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  @Get(':email')
  async getOne(@Req() request, @Res() response, @Param('email') email: string) {
    try {
      // const reqUser = request.user;
      // const userId = reqUser.id;
      // const userById = await this.userService.getUserById(userId);
      const user = await this.userService.getOne(email);
      // if (reqUser == user) {}
      return response.status(HttpStatus.OK).json({
        message: 'found successfully',
        user,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  @Post()
  async create(@Body() userData: User, @Res() response) {
    const newUser = await this.userService.create(userData);
    return response.status(HttpStatus.OK).json({
      message: 'created user successfully',
      newUser,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() userData: User) {
    await this.userService.update(id, userData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Res() response) {
    await this.userService.remove(id);
    return response.status(HttpStatus.OK).json({
      message: 'delete user sucessfully',
    });
  }
}
