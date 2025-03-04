import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { DepartmentsService } from './service';
import { Module } from '@nestjs/common';
import { DepartmentsRepository } from './repository';
import { DepartmentsController } from './controller';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [DepartmentsController],
    providers: [DepartmentsService, DepartmentsRepository],
    exports: [DepartmentsService],
})
export class DepartmentModule {}
