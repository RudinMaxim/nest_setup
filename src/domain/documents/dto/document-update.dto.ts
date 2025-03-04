import { PartialType } from '@nestjs/swagger';
import { DocumentCreateDto } from '.';

export class DocumentUpdateDto extends PartialType(DocumentCreateDto) {}
