import { Department } from '@prisma/client';
import { DepartmentBaseDto } from '.';
import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentCreateDto extends DepartmentBaseDto implements Omit<Department, 'id'> {
    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @IsInt({ message: 'Неверный тип данных' })
    members?: number;
}
