import { Document } from '@prisma/client';

export class DocumentEntity implements Omit<Document, 'id'> {
    readonly name: string;
    readonly path: string;
    readonly pinned: boolean;
    readonly departmentId: number | null;

    constructor(document: Omit<Document, 'id'>) {
        this.name = document.name;
        this.path = document.path;
        this.pinned = document.pinned;
        this.departmentId = document.departmentId;
    }
}
