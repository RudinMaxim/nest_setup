import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AuthModule } from './domain/auth';
import { DepartmentModule } from './domain/department';
import { DocumentsModule } from './domain/documents';
import { UsersModule } from './domain/user';
import { GoogleSheetsModule } from './infrastructure/google-sheets';
import { MailerModule } from './infrastructure/mailer';
import { PrismaModule } from './infrastructure/prisma';
import { LoggerModule } from './shared/logger';
import { UploadModule } from './shared/upload';

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
        ServeStaticModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const uploadDir = configService.get<string>('UPLOAD_DIR') ?? 'uploads';
                return [
                    {
                        rootPath: join(process.cwd(), uploadDir),
                        serveRoot: '/uploads',
                        exclude: ['/api/(.*)'],
                    },
                ];
            },
        }),
        UploadModule,
        TerminusModule,
        LoggerModule,
        PrismaModule,
        MailerModule,
        GoogleSheetsModule,
        // RedisModule,
        UsersModule,
        AuthModule,
        DepartmentModule,
        DocumentsModule,
    ],
    exports: [
        MailerModule,
        PrismaModule,
        LoggerModule,
        // RedisModule,
    ],
})
export class AppModule {}
