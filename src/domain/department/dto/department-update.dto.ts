import { PartialType } from '@nestjs/swagger';
import { DepartmentCreateDto } from '.';

export class DepartmentUpdateDto extends PartialType(DepartmentCreateDto) {}
