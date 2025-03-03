import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramClientService } from '../../../infrastructure/telegram-client/telegram-client.service';

@Update()
export class StartCommand {
    constructor(private readonly telegramClient: TelegramClientService) {}

    @Start()
    async onStart(@Ctx() ctx: Context) {
        if (!ctx.message) return;
        const chatId = ctx.message.chat.id;
        await this.telegramClient.sendMessage(chatId, 'Привет! Я ваш бот.');
    }
}
