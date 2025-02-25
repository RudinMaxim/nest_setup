import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(app: INestApplication, configService: ConfigService): void {
    const config = new DocumentBuilder()
        .setTitle(configService.get('SWAGGER_TITLE') || 'NestJS API')
        .setDescription(configService.get('SWAGGER_DESCRIPTION') || 'API Documentation')
        .setVersion(configService.get('SWAGGER_VERSION') || '1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description:
                    'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
            },
            'JWT-auth',
        )
        .addApiKey(
            {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-KEY',
                description: 'API Key for external access',
            },
            'apiKey',
        )
        .setDescription(
            `**Внутренняя документация для разработки**\n\n` +
                `[Репозиторий](${configService.get('SWAGGER_PROJECT_REPO')}) | [Техническая вики](${configService.get('SWAGGER_PROJECT_WIKI')})\n\n`,
        )
        .addServer(
            configService.get('SWAGGER_SERVER_DEV') || 'http://localhost:3000',
            'Development Server',
            {
                environment: {
                    default: 'development',
                    enum: ['development', 'staging', 'production'],
                },
            },
        )
        .addServer(
            configService.get('SWAGGER_SERVER_STAGE') || 'https://stage.example.com',
            'Production Server',
            {
                environment: {
                    default: 'staging',
                    enum: ['development', 'staging', 'production'],
                },
            },
        )
        .addServer(
            configService.get('SWAGGER_SERVER_PROD') || 'https://example.com',
            'Production Server',
            {
                environment: {
                    default: 'production',
                    enum: ['development', 'staging', 'production'],
                },
            },
        )
        .build();

    const options: SwaggerDocumentOptions = {
        operationIdFactory: (controllerKey: string, methodKey: string) =>
            `${controllerKey.replace('Controller', '')}_${methodKey}`,
        deepScanRoutes: true,
        ignoreGlobalPrefix: false,
    };

    const document = SwaggerModule.createDocument(app, config, options);
    const path = configService.get<string>('SWAGGER_PATH') || 'api-docs';

    SwaggerModule.setup(path, app, document, {
        explorer: true,
        swaggerOptions: {
            docExpansion: 'list',
            filter: true,
            showRequestDuration: true,
            persistAuthorization: true,
            displayOperationId: true,
            operationsSorter: 'alpha',
            tagsSorter: 'alpha',
        },
        customSiteTitle: configService.get('SWAGGER_TITLE') || 'API Documentation',
        customCss: `.swagger-ui .topbar { background-color: #2c3e50 } 
               .download-url-wrapper { display: none }`,
    });
}
