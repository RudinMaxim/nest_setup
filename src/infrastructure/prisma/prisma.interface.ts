import { PrismaClient } from '@prisma/client';

export interface IPrismaService {
    get client(): PrismaClient;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
