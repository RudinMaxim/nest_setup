import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthInfo } from '../../user/common';

export const GetAuthInfo = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthInfo => {
        const request = ctx.switchToHttp().getRequest<{ user: AuthInfo }>();
        return request.user;
    },
);
