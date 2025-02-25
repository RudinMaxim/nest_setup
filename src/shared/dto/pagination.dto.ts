import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsNumber, Min } from 'class-validator';

export class PaginationDto {
    @ApiProperty({ required: false, default: 1, minimum: 1 })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    @Min(1)
    page: number = 1;

    @ApiProperty({ required: false, default: 10, minimum: 1 })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    @Min(1)
    limit: number = 10;
}

export class PaginationResponseDto extends PaginationDto {
    @ApiProperty({ required: true, readOnly: true })
    @IsNumber()
    totalPages: number;

    @ApiProperty({ required: true, readOnly: true })
    @IsNumber()
    totalItems: number;
}
