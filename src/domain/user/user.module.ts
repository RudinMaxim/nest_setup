import { UsersController } from './controllers';
import { UsersService } from './service';
import { UsersRepository } from './repositories';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, PrismaService],
    exports: [UsersService],
})
export class UsersModule {}
