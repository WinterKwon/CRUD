import { PartialType } from '@nestjs/mapped-types';
import { AddUserDto } from './user.add.user.dto';

export class UpdateUserDto extends PartialType(AddUserDto) {}
