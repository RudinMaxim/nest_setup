import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './service/google-sheets.service';
import { UsersRepository } from 'src/domain/user/repositories';
import { GoogleSheetsController } from './controller';

@Module({
    controllers: [GoogleSheetsController],
    providers: [GoogleSheetsService, UsersRepository],
    exports: [GoogleSheetsService],
})
export class GoogleSheetsModule {}
