import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from './shared/logger/logger.module';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { MailerModule } from './infrastructure/mailer/mailer.module';
import { UsersModule } from './domain/user/user.module';
import { AuthModule } from './domain/auth/auth.module';
import { GoogleSheetsModule } from './infrastructure/google-sheets/google-sheets.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => [
                {
                    ttl: config.get('RATE_LIMIT_TTL', 60000), // 60 секунд
                    limit: config.get('RATE_LIMIT_MAX', 100),
                },
            ],
        }),
        TerminusModule,
        LoggerModule,
        PrismaModule,
        MailerModule,
        GoogleSheetsModule,
        // RedisModule,
        UsersModule,
        AuthModule,
    ],
    exports: [
        MailerModule,
        PrismaModule,
        // RedisModule,
    ],
})
export class AppModule {}
