import { Injectable, Inject, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

interface LogAnalysisService {
    analyzeLog(message: string, level: string, context?: string): void;
}

@Injectable()
export class LoggerService implements NestLoggerService {
    private logger: WinstonLogger;
    private logAnalysisService?: LogAnalysisService;

    constructor(@Inject('LogAnalysisService') logAnalysisService?: LogAnalysisService) {
        this.logger = createLogger({
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.printf(({ timestamp, level, message, context, ...meta }: any) => {
                    return `[${timestamp}] [${context || 'Application'}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                }),
            ),
            transports: [
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.printf(({ timestamp, level, message, context, ...meta }: any) => {
                            return `[${timestamp}] [${context || 'Application'}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                        }),
                    ),
                }),
                new transports.File({
                    filename: 'log/error.log',
                    level: 'error',
                    format: format.combine(format.uncolorize()),
                }),
                new transports.File({
                    filename: 'log/combined.log',
                    format: format.combine(format.uncolorize()),
                }),
                new transports.File({
                    filename: 'log/warn.log',
                    level: 'warn',
                    format: format.combine(format.uncolorize()),
                }),
                new transports.File({
                    filename: 'log/debug.log',
                    level: 'debug',
                    format: format.combine(format.uncolorize()),
                }),
            ],
        });

        if (logAnalysisService) {
            this.logAnalysisService = logAnalysisService;
        }
    }

    private analyzeLog(message: string, level: string, context?: string): void {
        if (this.logAnalysisService) {
            this.logAnalysisService.analyzeLog(message, level, context);
        }
    }

    log(message: string, context?: string): void {
        this.logger.info(message, { context });
        this.analyzeLog(message, 'info', context);
    }

    fatal(message: string, ...optionalParams: any[]) {
        this.logger.error(message, optionalParams);
        this.analyzeLog(message, 'error');
    }

    info(message: string, context?: string): void {
        this.logger.info(message, { context });
        this.analyzeLog(message, 'info', context);
    }

    error(message: string, trace?: string, context?: string): void {
        this.logger.error(message, { trace, context });
        this.analyzeLog(message, 'error', context);
    }

    warn(message: string, context?: string): void {
        this.logger.warn(message, { context });
        this.analyzeLog(message, 'warn', context);
    }

    debug(message: string, context?: string): void {
        this.logger.debug(message, { context });
        this.analyzeLog(message, 'debug', context);
    }

    verbose(message: string, context?: string): void {
        this.logger.verbose(message, { context });
        this.analyzeLog(message, 'verbose', context);
    }
}
