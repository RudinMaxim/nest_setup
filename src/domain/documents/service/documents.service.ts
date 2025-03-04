import { Injectable, NotFoundException } from '@nestjs/common';
import { Document } from '@prisma/client';
import { DocumentEntity } from '../entities/document.entity';
import { DocumentsRepository } from '../repositories/documents.repository';
import { DocumentCreateDto, DocumentUpdateDto } from '../dto';
import { DocumentFilters } from '../common';

export abstract class IDocumentsService {
    abstract create(dto: DocumentCreateDto): Promise<Document | null>;
    abstract find(id: number): Promise<Document | null>;
    abstract findAll(filters?: any): Promise<Document[] | null>;
    abstract update(id: number, dto: DocumentUpdateDto): Promise<Document | null>;
    abstract delete(id: number): Promise<Document | null>;
}

@Injectable()
export class DocumentsService implements IDocumentsService {
    constructor(private readonly documentsRepository: DocumentsRepository) {}

    async create(dto: DocumentCreateDto): Promise<Document | null> {
        const newDocument = new DocumentEntity(dto);
        return this.documentsRepository.create(newDocument);
    }

    async find(id: number): Promise<Document | null> {
        const document = await this.documentsRepository.find(id);
        if (!document) this.handleNotFound('Document');
        return document;
    }

    async findAll(filters?: DocumentFilters): Promise<Document[]> {
        const documents = await this.documentsRepository.findAll(filters);
        if (!documents?.length) this.handleNotFound('Documents');
        return documents;
    }

    async update(id: number, dto: DocumentUpdateDto): Promise<Document | null> {
        try {
            const updatedDocument = await this.documentsRepository.update(id, dto);
            if (!updatedDocument) {
                this.handleNotFound('Document to update');
            }
            return updatedDocument;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async delete(id: number): Promise<Document | null> {
        try {
            const deletedDocument = await this.documentsRepository.delete(id);
            if (!deletedDocument) {
                this.handleNotFound('Document to delete');
            }
            return deletedDocument;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    protected handleNotFound(entity: string): void {
        throw new NotFoundException(`${entity} not found`);
    }
}
