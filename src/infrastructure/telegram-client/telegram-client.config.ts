import { ConfigType } from '@nestjs/config';
import { TelegrafModuleOptions } from 'nestjs-telegraf';
import telegramConfig from '../../shared/config/configuration';

export const getTelegramConfig = (
    config: ConfigType<typeof telegramConfig>,
): TelegrafModuleOptions => ({
    token: config.token,
    options: {
        handlerTimeout: config.handlerTimeout,
        telegram: {
            agent: config.environment === 'production' ? undefined : undefined,
        },
    },
    launchOptions: {
        webhook:
            config.environment === 'production'
                ? {
                      domain: 'your-domain.com',
                      port: 443,
                  }
                : undefined,
    },
});
