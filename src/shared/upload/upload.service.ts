import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
    constructor(private readonly configService: ConfigService) {}

    getFileUrl(filename: string): string {
        return `/uploads/${filename}`;
    }

    getAbsolutePath(filename: string): string {
        const uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
        return `${uploadDir}/${filename}`;
    }
}
