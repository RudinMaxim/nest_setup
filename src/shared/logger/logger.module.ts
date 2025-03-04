import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Module({
    providers: [
        LoggerService,
        {
            provide: 'LogAnalysisService',
            useValue: {
                analyzeLog: () => {},
            },
        },
    ],
    exports: [LoggerService],
})
export class LoggerModule {}
