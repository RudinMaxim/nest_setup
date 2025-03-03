import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

export interface ITelegramClientService {
    getInstance(): Telegraf<Context<Update>>;
    sendMessage(chatId: number, text: string): Promise<void>;
    startScene(chatId: number, sceneId: string): Promise<void>;
}
