import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { configureSwagger } from './shared/swagger/swagger.config';
import { LoggerService } from './shared/logger/logger.service';
import helmet from 'helmet';
import { HttpExceptionFilter } from './domain/common/filters/http-exception.filter';

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
        logger.log(
            `Swagger documentation is available at: ${await app.getUrl()}/${configService.get('SWAGGER_PATH')}`,
        );
    }

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
}

export const boot = bootstrap();
