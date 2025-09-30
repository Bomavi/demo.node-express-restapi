import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserDocument } from 'src/api/user/schema/user.schema';
import { UserService } from 'src/api/user/user.service';
import { comparePassword } from 'src/shared/utils/password.util';
import { ms, type StringValue } from 'src/shared/utils/ms.util';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt.interface';

import type { Request, Response } from 'express';

@Injectable()
export class AuthService {
  private readonly COOKIE_DOMAIN: string;
  private readonly JWT_ACCESS_TOKEN_TTL: StringValue;
  private readonly JWT_REFRESH_TOKEN_TTL: StringValue;

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<StringValue>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_TTL',
    );
  }

  async validate(id: string): Promise<UserDocument> {
    return await this.usersService.findById(id);
  }

  async login(res: Response, credentials: LoginDto) {
    const user = await this.usersService.findOne(credentials.email, [
      '_id',
      'username',
      'passwordHash',
    ]);

    const INVALID_CREDENTIALS_ERROR = 'Invalid credentials';

    if (!user) {
      throw new NotFoundException(INVALID_CREDENTIALS_ERROR);
    }

    const isPasswordValid = await comparePassword(
      credentials.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new NotFoundException(INVALID_CREDENTIALS_ERROR);
    }

    return this.authenticate(res, user);
  }

  async register({ email, password, username, theme }: RegisterDto) {
    const user = await this.usersService.create({
      email,
      password,
      username,
      theme,
    });

    return user._id;
  }

  async refreshToken(req: Request, res: Response) {
    const refresh_token = req.cookies['refresh_token'] as string;

    if (!refresh_token) {
      throw new NotFoundException('Refresh token not found');
    }

    const payload = await this.jwtService
      .verifyAsync<JwtPayload>(refresh_token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      })
      .catch((reason) => {
        throw new ForbiddenException(reason);
      });

    if (!payload) {
      throw new NotFoundException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub, ['_id']);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.authenticate(res, user);
  }

  logout(res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  private async authenticate(res: Response, user: UserDocument) {
    const { access_token, refresh_token, refreshTokenExpiresIn } =
      await this.generateJwtToken(user);

    this.setCookie(res, refresh_token, refreshTokenExpiresIn);

    return {
      access_token,
    };
  }

  private async generateJwtToken(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user.id as string,
    };

    const refreshTokenExpiresIn = new Date(
      Date.now() + ms(this.JWT_REFRESH_TOKEN_TTL),
    );

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return {
      access_token,
      refresh_token,
      refreshTokenExpiresIn,
    };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refresh_token', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires,
    });
  }
}
