import { Model, MongooseError } from 'mongoose';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schema/task.schema';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(task: CreateTaskDto, userId: string): Promise<TaskDocument> {
    try {
      const newTask = new this.taskModel({ ...task, createdBy: userId });
      return (await newTask.save()).populate('createdBy', ['_id', 'username']);
    } catch (error) {
      const err = error as MongooseError;
      throw new Error('Error creating task: ' + err.message);
    }
  }

  async findAll(searchQuery: string = ''): Promise<TaskDocument[]> {
    return await this.taskModel
      .find({
        description: new RegExp(searchQuery, 'i'),
      })
      .sort({ createdAt: -1 })
      .populate('createdBy', ['_id', 'username']) // should we remove _id as it passed by default?
      .exec();
  }

  async findById(id: string): Promise<TaskDocument> {
    return await this.taskModel
      .findById(id)
      .orFail(new NotFoundException('Task not found'))
      .populate('createdBy', ['_id', 'username'])
      .exec();
  }

  async update(
    id: string,
    userId: string,
    task: UpdateTaskDto,
  ): Promise<TaskDocument> {
    return await this.taskModel
      .findOneAndUpdate(
        {
          _id: id,
          createdBy: userId,
        },
        task,
        {
          new: true,
        },
      )
      .orFail(
        new NotFoundException(
          'Task not found or user not authorized to update it',
        ),
      )
      .exec();
  }

  async remove(id: string, userId: string): Promise<TaskDocument> {
    return await this.taskModel
      .findOneAndDelete({ _id: id, createdBy: userId })
      .select('id')
      .orFail(new NotFoundException('Task not found'))
      .exec();
  }
}
