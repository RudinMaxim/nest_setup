import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationExampleDto {
    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @IsPositive()
    page: number = 1;

    @ApiProperty({ required: false, default: 10 })
    @IsOptional()
    @IsPositive()
    limit: number = 10;
}
