import { Document } from '@prisma/client';
import { BaseDto } from '../../../shared/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class DocumentBaseDto extends BaseDto implements Document {
    @ApiProperty({ description: 'The name of the document' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'The path to the document' })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiProperty({ description: 'Whether the document is pinned or not', default: false })
    @IsBoolean()
    pinned: boolean;

    @ApiProperty({ description: 'The ID of the department', nullable: true })
    @IsOptional()
    @IsNumber()
    departmentId: number | null;
}
