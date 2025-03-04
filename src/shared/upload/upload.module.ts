import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { UploadService } from './upload.service';

@Module({
    imports: [
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const uploadDir = configService.get<string>('UPLOAD_DIR', 'uploads');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                return {
                    storage: diskStorage({
                        destination: (req, file, cb) => {
                            cb(null, uploadDir);
                        },
                        filename: (req, file, cb) => {
                            const hash = crypto.createHash('sha256');
                            hash.update(Date.now().toString());
                            const ext = path.extname(file.originalname);
                            cb(null, `${hash.digest('hex')}${ext}`);
                        },
                    }),
                    fileFilter: (
                        req: Request,
                        file: Express.Multer.File,
                        cb: (error: Error | null, acceptFile: boolean) => void,
                    ) => {
                        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
                        if (allowedMimeTypes.includes(file.mimetype)) {
                            cb(null, true);
                        } else {
                            cb(
                                new Error(
                                    'Unsupported file type. Only PNG, JPEG, and WebP are allowed.',
                                ),
                                false,
                            );
                        }
                    },
                };
            },
        }),
    ],
    providers: [UploadService],
    exports: [UploadService],
})
export class UploadModule {}
