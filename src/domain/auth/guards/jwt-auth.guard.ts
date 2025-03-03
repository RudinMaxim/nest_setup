import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { EXCLUDED_PATHS } from '../common/auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();

        const isExcludedPath = EXCLUDED_PATHS.some((path) => request.url?.startsWith(path));

        if (isExcludedPath) {
            return true;
        }

        return super.canActivate(context);
    }
}
