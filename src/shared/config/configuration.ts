import { registerAs } from '@nestjs/config';

export class EnvironmentVariables {
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_SESSION_NAME = 'session';
    TELEGRAM_HANDLER_TIMEOUT = 60000;
    NODE_ENV: 'development' | 'production' = 'development';
}

export default registerAs('telegramConfig', () => ({
    token: process.env.TELEGRAM_BOT_TOKEN ?? '',
    sessionName: process.env.TELEGRAM_SESSION_NAME ?? 'session',
    handlerTimeout: parseInt(process.env.TELEGRAM_HANDLER_TIMEOUT ?? '60000', 10),
    environment: process.env.NODE_ENV ?? 'development',
}));
