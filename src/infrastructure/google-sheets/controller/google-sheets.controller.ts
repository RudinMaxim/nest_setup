import { Controller, Post } from '@nestjs/common';
import { GoogleSheetsService } from '../service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

abstract class IGoogleSheetsController {
    abstract loadSheets(): Promise<void>;
}

@ApiTags('Google таблицы')
@Controller('google-sheets')
export class GoogleSheetsController implements IGoogleSheetsController {
    constructor(private readonly googleSheetsService: GoogleSheetsService) {}

    @ApiOperation({
        summary:
            'Получает данные пользователя из google таблиц и записывает их в базу данных по email.',
    })
    @ApiResponse({ status: 200, description: 'OK' })
    @Post('load')
    async loadSheets(): Promise<void> {
        await this.googleSheetsService.load();
    }
}
