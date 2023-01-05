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
import { AddUserDto } from './dto/user.add.user.dto';
import { UpdateUserDto } from './dto/user.update.user.dto';

@Controller('users')
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
      return response.status(HttpStatus.BAD_REQUEST).json(err.message);
    }
  }

  @Post()
  async create(@Body() userData: AddUserDto, @Res() response) {
    try {
      const newUser = await this.userService.create(userData);
      return response.status(HttpStatus.OK).json({
        message: 'created user successfully',
        newUser,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        messasge: 'failed to create new user',
      });
    }
  }

  @Patch(':email')
  async update(
    @Param('email') email: string,
    @Body() userData: UpdateUserDto,
    @Res() response,
  ) {
    try {
      const updatedUser = await this.userService.update(email, userData);
      return response.status(HttpStatus.OK).json({
        message: 'updated user successfully',
        updatedUser,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: 'failed to update user data',
        err,
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Res() response) {
    try {
      const result = await this.userService.remove(id);
      return response.status(HttpStatus.OK).json({
        message: result,
      });
    } catch (err) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: err.message });
    }
  }
}
