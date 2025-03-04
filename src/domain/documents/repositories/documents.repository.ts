import { Injectable } from '@nestjs/common';
import { DocumentEntity } from '../entities/document.entity';
import { Document, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DocumentFilters } from '../common';

@Injectable()
export class DocumentsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(document: DocumentEntity): Promise<Document> {
        return this.prisma.document.create({
            data: document,
            include: { department: true },
        });
    }

    async find(id: number): Promise<Document | null> {
        return this.prisma.document.findUnique({
            where: { id },
            include: { department: true },
        });
    }

    async findAll(filters?: DocumentFilters): Promise<Document[]> {
        const where: Prisma.DocumentWhereInput = {};

        if (filters?.departmentId) {
            where.departmentId = Number(filters.departmentId);
        }
        if (filters?.pinned !== undefined) {
            where.pinned = filters.pinned === 'true';
        }

        return this.prisma.document.findMany({
            where,
            include: { department: true },
        });
    }

    async update(id: number, data: Partial<Document>): Promise<Document> {
        return this.prisma.document.update({
            where: { id },
            data,
            include: { department: true },
        });
    }

    async delete(id: number): Promise<Document> {
        return this.prisma.document.delete({
            where: { id },
            include: { department: true },
        });
    }
}
