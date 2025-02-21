import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Example } from '@prisma/client';

@Injectable()
export class DatabaseRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Omit<Example, 'id' | 'createdAt' | 'updatedAt'>): Promise<Example> {
        return this.prisma.example.create({ data });
    }

    async findAll(pagination: { skip: number; take: number }): Promise<Example[]> {
        return this.prisma.example.findMany({ ...pagination });
    }

    async findOne(id: number): Promise<Example | null> {
        return this.prisma.example.findUnique({ where: { id } });
    }

    async update(id: number, data: Partial<Example>): Promise<Example> {
        return this.prisma.example.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.example.delete({ where: { id } });
    }
}
