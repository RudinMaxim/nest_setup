import { Department } from '@prisma/client';
import { BaseDto } from '../../../shared/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class DepartmentBaseDto extends BaseDto implements Department {
    @ApiProperty({ example: 'HR Department' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Description is wrong' })
    @IsOptional()
    @IsString()
    description: string | null;

    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @IsInt()
    headId: number | null;

    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @IsInt()
    competenceId: number | null;
}
