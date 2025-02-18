import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { configureSwagger } from './shared/swagger/swagger.config';
import { LoggerService } from './shared/logger/logger.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const logger = app.get(LoggerService);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    configureSwagger(app);

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
}

export const boot = bootstrap();
