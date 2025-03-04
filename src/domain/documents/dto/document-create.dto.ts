import { Document } from '@prisma/client';
import { DocumentBaseDto } from '.';

export class DocumentCreateDto extends DocumentBaseDto implements Omit<Document, 'id'> {}
