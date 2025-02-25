import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { FilterDto } from './filter.dto';
import { SortDto } from './sort.dto';

export class QueryParamsDto {
    @ApiProperty({ required: false, type: PaginationDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => PaginationDto)
    pagination?: PaginationDto = new PaginationDto();

    @ApiProperty({ required: false, type: FilterDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => FilterDto)
    filter?: FilterDto;

    @ApiProperty({ required: false, type: SortDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => SortDto)
    sort?: SortDto;
}
