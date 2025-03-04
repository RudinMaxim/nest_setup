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
import { DepartmentModule } from './domain/department/department.module';
import { DocumentsModule } from './domain/documents/documents.module';
import { UploadModule } from './shared/upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static/dist';
import { join } from 'path';

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
