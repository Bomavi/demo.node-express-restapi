import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { type PublicUserData } from 'src/api/user/schema/user.schema';

export const AuthorizedUser = createParamDecorator(
  (data: keyof PublicUserData, ctx: ExecutionContext) => {
    const request: Request & { user: PublicUserData } = ctx
      .switchToHttp()
      .getRequest();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return (data ? user[data] : user) as PublicUserData | typeof data;
  },
);
