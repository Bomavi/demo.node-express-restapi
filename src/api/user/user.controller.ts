import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { WithJWT } from 'src/api/auth/decorators/with-jwt.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @WithJWT()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() user: CreateUserDto) {
    return await this.userService.create(user);
  }

  @WithJWT()
  @HttpCode(HttpStatus.OK)
  @Get()
  async fetchAll() {
    return await this.userService.findAll();
  }

  @WithJWT()
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async fetchOne(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @WithJWT()
  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  async update(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return await this.userService.update(id, user);
  }

  @WithJWT()
  @HttpCode(HttpStatus.OK)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
