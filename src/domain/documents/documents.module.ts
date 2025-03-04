import { Module } from '@nestjs/common';
import { DocumentsController } from './controllers/documents.http.controller';
import { DocumentsService } from './service/documents.service';
import { DocumentsRepository } from './repositories/documents.repository';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DocumentsController],
    providers: [DocumentsService, DocumentsRepository],
    exports: [DocumentsService],
})
export class DocumentsModule {}
