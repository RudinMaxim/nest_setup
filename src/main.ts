import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { configureSwagger } from './shared/swagger/swagger.config';
import { LoggerService } from './shared/logger/logger.service';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const logger = app.get(LoggerService);

    if (configService.get<boolean>('app.cors.enabled')) {
        app.enableCors({
            origin: configService.get<string>('app.cors.origins', '').split(','),
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            credentials: true,
        });
    }

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    if (configService.get('SWAGGER_ENABLED') === 'true') {
        configureSwagger(app);
    }

    app.setGlobalPrefix('api/v1');

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(
        `Swagger documentation is available at: ${await app.getUrl()}/${configService.get('SWAGGER_PATH')}`,
    );
}

export const boot = bootstrap();
