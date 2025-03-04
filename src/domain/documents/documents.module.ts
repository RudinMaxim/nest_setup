import { Module } from '@nestjs/common';
import { DocumentsController } from './controllers';
import { DocumentsService } from './service';
import { DocumentsRepository } from './repositories';
import { PrismaModule } from 'src/infrastructure/prisma';

@Module({
    imports: [PrismaModule],
    controllers: [DocumentsController],
    providers: [DocumentsService, DocumentsRepository],
    exports: [DocumentsService],
})
export class DocumentsModule {}
