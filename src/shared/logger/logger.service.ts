import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
    private logger: WinstonLogger;

    constructor() {
        this.logger = createLogger({
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.colorize(),
                format.printf(({ timestamp, level, message, context, ...meta }: any) => {
                    return `[${timestamp}] [${context || 'Application'}] ${level}: ${message} ${
                        Object.keys(meta).length ? JSON.stringify(meta) : ''
                    }`;
                }),
            ),
            transports: [
                new transports.Console(),
                new transports.File({ filename: 'error.log', level: 'error' }),
                new transports.File({ filename: 'combined.log' }),
            ],
        });
    }

    log(message: string, context?: string) {
        this.logger.info(message, { context });
    }

    error(message: string, trace?: string, context?: string) {
        this.logger.error(message, { trace, context });
    }

    warn(message: string, context?: string) {
        this.logger.warn(message, { context });
    }

    debug(message: string, context?: string) {
        this.logger.debug(message, { context });
    }

    verbose(message: string, context?: string) {
        this.logger.verbose(message, { context });
    }
}
