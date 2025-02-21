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
                new transports.File({ filename: 'log/error.log', level: 'error' }),
                new transports.File({ filename: 'log/combined.log' }),
            ],
        });
    }

    log(message: string, context?: string): void {
        this.logger.info(message, { context });
    }

    fatal(message: string, ...optionalParams: any[]) {
        this.logger.error(message, optionalParams);
    }

    info(message: string, context?: string): void {
        this.logger.info(message, { context });
    }

    error(message: string, trace?: string, context?: string): void {
        this.logger.error(message, { trace, context });
    }

    warn(message: string, context?: string): void {
        this.logger.warn(message, { context });
    }

    debug(message: string, context?: string): void {
        this.logger.debug(message, { context });
    }

    verbose(message: string, context?: string): void {
        this.logger.verbose(message, { context });
    }
}
