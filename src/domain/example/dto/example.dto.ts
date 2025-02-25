import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsEnum, IsDate, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { QueryParamsDto } from 'src/shared/dto';

export enum ExampleSortField {
    ID = 'id',
    TITLE = 'title',
    VALUE = 'value',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export class ExampleQueryParamsDto extends QueryParamsDto {
    @ApiProperty({ required: false, example: 100, minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    minValue?: number;

    @ApiProperty({ required: false, example: 500, minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    maxValue?: number;

    @ApiProperty({
        required: false,
        example: 'search term',
        description: 'Search in title and description',
    })
    @IsOptional()
    @IsString()
    searchTerm?: string;

    @ApiProperty({ required: false, enum: ExampleSortField, default: ExampleSortField.CREATED_AT })
    @IsOptional()
    @IsEnum(ExampleSortField)
    sortField?: ExampleSortField;

    @ApiProperty({
        required: false,
        example: ['title1', 'title2'],
        description: 'Filter by multiple titles',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }: { value: string }) => {
        return Array.isArray(value) ? value : value.split(',').map((v) => v.trim());
    })
    titles?: string[];

    @ApiProperty({
        required: false,
        example: '2023-01-01',
        description: 'Filter by created after date',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    createdAfter?: Date;

    @ApiProperty({
        required: false,
        example: '2023-12-31',
        description: 'Filter by created before date',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    createdBefore?: Date;
}
