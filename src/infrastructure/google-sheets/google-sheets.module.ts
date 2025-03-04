import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './service';
import { UsersRepository } from '../../domain/user';
import { GoogleSheetsController } from './controller';

@Module({
    controllers: [GoogleSheetsController],
    providers: [GoogleSheetsService, UsersRepository],
    exports: [GoogleSheetsService],
})
export class GoogleSheetsModule {}
