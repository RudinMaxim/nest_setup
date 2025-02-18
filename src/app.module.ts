import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './shared/logger/logger.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        LoggerModule,
        PrismaModule,
    ],
})
export class AppModule {}
