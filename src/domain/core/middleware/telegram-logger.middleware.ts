import { LoggerService } from '@nestjs/common';
import { NextFunction } from 'express';
import { Middleware } from 'telegraf';

export class TelegramLoggerMiddleware {
    constructor(private readonly logger: LoggerService) {}

    resolve(): Middleware<any> {
        return (ctx: { update: unknown }, next: NextFunction) => {
            this.logger.log(`Update: ${JSON.stringify(ctx.update)}`);
            next();
        };
    }
}
