import { Model, MongooseError } from 'mongoose';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { hashPassword } from 'src/shared/utils/password.util';

import {
  PUBLIC_USER_FIELDS,
  PublicUserData,
  User,
  UserDocument,
} from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(user: CreateUserDto): Promise<PublicUserData> {
    const foundUser = await this.findOne(user.email);

    if (foundUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const newUser = new this.userModel(user);

      newUser.passwordHash = await hashPassword(user.password);
      newUser.email = user.email.toLowerCase();
      newUser.username = user.username.trim();
      newUser.theme = user.theme.trim();

      return await newUser.save({ safe: true });
    } catch (error) {
      const err = error as MongooseError;
      throw new ConflictException('Error creating user: ' + err.message);
    }
  }

  async findAll(): Promise<PublicUserData[]> {
    return await this.userModel
      .find()
      .select(PUBLIC_USER_FIELDS)
      .orFail()
      .exec();
  }

  async findById(
    id: string,
    fields: (keyof UserDocument)[] = PUBLIC_USER_FIELDS,
  ): Promise<UserDocument> {
    return this.userModel
      .findById(id)
      .select(fields)
      .orFail(new NotFoundException('User not found')) // WARN: need for auth client validation
      .exec();
  }

  async findOne(
    email: string,
    fields: (keyof UserDocument)[] = PUBLIC_USER_FIELDS,
  ): Promise<UserDocument | null | undefined> {
    return this.userModel.findOne({ email }).select(fields).exec();
  }

  async update(id: string, user: UpdateUserDto): Promise<PublicUserData> {
    return await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .select(PUBLIC_USER_FIELDS)
      .orFail()
      .exec();
  }

  async delete(id: string): Promise<PublicUserData> {
    return await this.userModel
      .findByIdAndDelete(id, { returnOriginal: true })
      .select('id')
      .orFail()
      .exec();
  }
}
