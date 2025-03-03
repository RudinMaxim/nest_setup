import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { ITelegramClientService } from './telegram-client.interface';

@Injectable()
export class TelegramClientService implements ITelegramClientService {
    private readonly logger = new Logger(TelegramClientService.name);
    private bot: Telegraf<Context>;

    constructor() {
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            throw new Error('TELEGRAM_BOT_TOKEN is not defined');
        }
        this.bot = new Telegraf<Context>(process.env.TELEGRAM_BOT_TOKEN);
        this.setupErrorHandling();
    }

    /**
     * Возвращает экземпляр Telegraf
     */
    getInstance(): Telegraf<Context> {
        return this.bot;
    }

    /**
     * Отправляет сообщение в указанный чат
     */
    async sendMessage(chatId: number, text: string): Promise<void> {
        try {
            await this.bot.telegram.sendMessage(chatId, text);
            this.logger.log(`Message sent to chat ${chatId}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Failed to send message to chat ${chatId}: ${error.message}`);
            } else {
                this.logger.error('Failed to send message to chat: Unknown error');
            }
            throw error;
        }
    }

    /**
     * Запускает сцену для указанного чата
     */
    async startScene(chatId: number, sceneId: string): Promise<void> {
        try {
            await this.bot.telegram.sendMessage(chatId, 'Starting scene...');
            this.logger.log(`Scene ${sceneId} started for chat ${chatId}`);
        } catch (error) {
            this.logger.error(
                `Failed to start scene ${sceneId} for chat ${chatId}: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw error;
        }
    }
    /**
     * Настройка обработки ошибок
     */
    private setupErrorHandling(): void {
        this.bot.catch((err: unknown, ctx: Context) => {
            if (err instanceof Error) {
                this.logger.error(`Error occurred: ${err.message}`);
            } else {
                this.logger.error('Error occurred: Unknown error');
            }
            ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        });
    }

    /**
     * Запуск бота
     */
    async launch(): Promise<void> {
        try {
            await this.bot.launch();
            this.logger.log('Telegram bot started successfully');
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Failed to stop bot: ${error.message}`);
            } else {
                this.logger.error('Failed to stop bot: Unknown error');
            }
            throw error;
        }
    }

    /**
     * Остановка бота
     */
    stop(): void {
        try {
            this.bot.stop();
            this.logger.log('Telegram bot stopped successfully');
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Failed to stop bot: ${error.message}`);
            } else {
                this.logger.error('Failed to stop bot: Unknown error');
            }
            throw error;
        }
    }
}
