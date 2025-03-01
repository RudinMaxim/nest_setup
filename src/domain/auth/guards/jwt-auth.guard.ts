import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    static readonly EXCLUDED_PATHS: string[] = [
        '/login',
        '/forgot',
        '/users/reset-password',
        '/api-docs',
        '/google-sheets',
        '/uploads',
        '/users/format',
    ];

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const isExcludedPath = JwtAuthGuard.EXCLUDED_PATHS.some((path) =>
            request.path.startsWith(path),
        );

        if (isExcludedPath) {
            return true;
        }

        return super.canActivate(context) as boolean | Promise<boolean> | Observable<boolean>;
    }
}
