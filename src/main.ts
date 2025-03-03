import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './shared/logger/logger.service';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });

    const logger = app.get(LoggerService);

    app.useLogger(logger);
}

bootstrap().catch((err) => {
    console.error('Bootstrapping error:', err);
    process.exit(1);
});
