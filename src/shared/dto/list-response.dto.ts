import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { PaginationResponseDto } from './pagination.dto';

export class ListResponseDto<T> {
    @ApiProperty({ isArray: true })
    @ValidateNested({ each: true })
    items: T[];

    @ApiProperty({ type: PaginationResponseDto })
    @ValidateNested()
    @Type(() => PaginationResponseDto)
    pagination: PaginationResponseDto;
}
