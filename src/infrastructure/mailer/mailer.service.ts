import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
    private readonly transporter: Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: Number(this.configService.get('SMTP_PORT')),
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
        });
    }

    async sendMail(to: string, subject: string, text: string, html?: string) {
        const from = this.configService.get<string>('MAIL_FROM');
        await this.transporter.sendMail({ from, to, subject, text, html });
    }
}
