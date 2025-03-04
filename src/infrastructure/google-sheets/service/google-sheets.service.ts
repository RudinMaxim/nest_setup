/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';
import { Grade } from '@prisma/client';
import { UsersRepository } from '../../../domain/user';

abstract class IGoogleSheetsService {
    abstract load: () => Promise<void>;
}

//! TODO: Правильно типизировать, убрать any и отключить eslint
@Injectable()
export class GoogleSheetsService implements IGoogleSheetsService {
    private service: sheets_v4.Sheets;
    private readonly logger = new Logger(GoogleSheetsService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly usersRepository: UsersRepository,
    ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
                private_key: this.configService.get<string>('GOOGLE_PRIVATE_KEY'),
            },
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.service = google.sheets({ version: 'v4', auth });
    }

    async load(): Promise<void> {
        const spreadsheetsIDs = [
            '1xg_9LaRRLA5MNRSyZaO7udBlvoW_pRMEL3lROFARnA4',
            '1IExOhNvct2BHavj6F8iwnvBbwOT1UtRS7CGKd5VOC9M',
            '1V3U3SqYv8jFCxEGJL_WgtblFMV4FeAB55Mt7tyi1Qyo',
            '1xDs9AUQuDzymZbTInFhKBtToyG7GBHpbiRMrA-49TK0',
            '1e_4fdzbNZYZWJgISivzZmAcLCszYDawW10LWy9QSQ04',
            '1JTIPPE_Jpe7HfOywiGj_ujxBnOowoJqXyS5cND101eg',
            '1-lDk2P9vh_l7KmldxgAikiqgEJAkk1ja7psCHxNYmUo',
            '1d8568pLrY62JWGM_-1CufzLY-UH4Hh6yPIeFce4G8ak',
            '1lxycaHDfCY5kurgbX-sNj5pajo8bH2s6Cy4LzivimhA',
        ];

        const userGrade: Record<string, Grade> = {
            стажер: 'INTERN',
            junior: 'JUNIOR',
            middle: 'MIDDLE',
            'middle +': 'MIDDLE_PLUS',
            senior: 'SENIOR',
        };

        for (const spreadsheetId of spreadsheetsIDs) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const sheet = await this.service.spreadsheets.values.get({
                    spreadsheetId,
                    range: 'Реестр!A2:G',
                });

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const rows = sheet?.data.values;

                if (!rows) continue;

                for (const row of rows) {
                    const email = row[2]?.trim();

                    if (!email) continue;

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const grade = userGrade[`${row.at(-2)?.toLowerCase()}`];
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                    const dateAttestation = new Date(row.at(-1).split('.').reverse().join('-'));

                    const existedUser = await this.usersRepository.findByEmail(email);

                    if (!existedUser) continue;

                    await this.usersRepository.update(existedUser.id, {
                        grade,
                        dateAttestation,
                    });
                }
            } catch (err) {
                if (err instanceof Error) this.logger.error(`[GoogleSheetsService] ${err.message}`);
            }
        }
    }
}
