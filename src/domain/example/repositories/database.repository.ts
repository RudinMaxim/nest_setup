import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Example, Prisma } from '@prisma/client';

interface ExampleRepositoryInterface {
    create(data: Omit<Example, 'id' | 'createdAt' | 'updatedAt'>): Promise<Example>;
    findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ExampleWhereInput;
        orderBy?: Prisma.ExampleOrderByWithRelationInput;
    }): Promise<Example[]>;
    findAllWithCount(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ExampleWhereInput;
        orderBy?: Prisma.ExampleOrderByWithRelationInput;
    }): Promise<[Example[], number]>;
    findOne(id: number): Promise<Example | null>;
    update(id: number, data: Partial<Example>): Promise<Example>;
    delete(id: number): Promise<void>;
    count(where?: Prisma.ExampleWhereInput): Promise<number>;
}

@Injectable()
export class DatabaseRepository implements ExampleRepositoryInterface {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Omit<Example, 'id' | 'createdAt' | 'updatedAt'>): Promise<Example> {
        return this.prisma.example.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ExampleWhereInput;
        orderBy?: Prisma.ExampleOrderByWithRelationInput;
    }): Promise<Example[]> {
        return this.prisma.example.findMany(params);
    }

    async findAllWithCount(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ExampleWhereInput;
        orderBy?: Prisma.ExampleOrderByWithRelationInput;
    }): Promise<[Example[], number]> {
        const [items, count] = await Promise.all([
            this.prisma.example.findMany(params),
            this.prisma.example.count({ where: params.where }),
        ]);

        return [items, count];
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

    async count(where?: Prisma.ExampleWhereInput): Promise<number> {
        return this.prisma.example.count({ where });
    }
}
