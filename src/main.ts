import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { configureSwagger } from './shared/swagger';
import { LoggerService } from './shared/logger';
import { HttpExceptionFilter } from './shared/filters';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });

    const configService = app.get(ConfigService);
    const logger = app.get(LoggerService);

    app.useLogger(logger);
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            forbidUnknownValues: true,
            validationError: { target: false },
        }),
    );

    app.use(helmet());
    if (configService.get<boolean>('app.cors.enabled')) {
        app.enableCors({
            origin: configService.get<string>('app.cors.origins', '*').split(','),
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
    }

    if (configService.get('SWAGGER_ENABLED') === 'true') {
        configureSwagger(app, configService);
    }

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    logger.log(`✨ Application is running on: ${await app.getUrl()} 🚀`);
    if (configService.get('SWAGGER_ENABLED') === 'true') {
        logger.log(
            `✨ Swagger documentation is available at: http://localhost:3000/${configService.get('SWAGGER_PATH')} 🚀`,
        );
    }
}

export const boot = bootstrap();
