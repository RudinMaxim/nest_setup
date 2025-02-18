import { Injectable, Logger } from '@nestjs/common';
import { LoggerService } from './logger.service.interface';

@Injectable()
export class NestLoggerService extends Logger implements LoggerService {
    log(message: string, context?: string) {
        super.log(message, context);
    }

    error(message: string, trace: string, context?: string) {
        super.error(message, trace, context);
    }

    warn(message: string, context?: string) {
        super.warn(message, context);
    }

    debug(message: string, context?: string) {
        super.debug(message, context);
    }
}
