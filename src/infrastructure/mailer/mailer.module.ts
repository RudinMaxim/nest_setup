import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'MAILER_TRANSPORT',
            useFactory: (configService: ConfigService) => {
                return nodemailer.createTransport({
                    host: configService.get<string>('SMTP_HOST'),
                    port: Number(configService.get('SMTP_PORT')),
                    auth: {
                        user: configService.get<string>('SMTP_USER'),
                        pass: configService.get<string>('SMTP_PASSWORD'),
                    },
                });
            },
            inject: [ConfigService],
        },
        MailerService,
    ],
    exports: [MailerService],
})
export class MailerModule {}
