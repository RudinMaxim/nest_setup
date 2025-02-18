import { Global, Module } from '@nestjs/common';
import { NestLoggerService } from './prisma.service';
import { LoggerModule } from '../../shared/logger/logger.module';

@Global()
@Module({
    imports: [LoggerModule],
    providers: [NestLoggerService],
    exports: [NestLoggerService],
})
export class PrismaModule {}
