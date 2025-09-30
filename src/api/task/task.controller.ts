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
  Query,
} from '@nestjs/common';

import { AuthorizedUser } from 'src/api/auth/decorators/authorized-user.decorator';
import { WithJWT } from 'src/api/auth/decorators/with-jwt.decorator';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @WithJWT()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() task: CreateTaskDto,
    @AuthorizedUser('id') userId: string,
  ) {
    return this.taskService.create(task, userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async fetchAll(@Query('q') searchQuery: string) {
    return await this.taskService.findAll(searchQuery);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async fetchOne(@Param('id') id: string) {
    return this.taskService.findById(id);
  }

  @WithJWT()
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @AuthorizedUser('id') userId: string,
    @Body() task: UpdateTaskDto,
  ) {
    return this.taskService.update(id, userId, task);
  }

  @WithJWT()
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string, @AuthorizedUser('id') userId: string) {
    return this.taskService.remove(id, userId);
  }
}
