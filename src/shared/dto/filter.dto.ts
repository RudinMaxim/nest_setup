import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterFieldDto {
    @ApiProperty({ required: false, example: 'eq' })
    @IsOptional()
    @IsString()
    operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'like';

    @ApiProperty({ required: false })
    @IsOptional()
    value?: unknown;
}

export class FilterDto {
    @ApiProperty({ required: false, example: 'search term' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        required: false,
        additionalProperties: {
            type: 'object',
            properties: {
                operator: { type: 'string' },
                value: { type: 'string' },
            },
        },
        example: { name: { operator: 'like', value: 'John' } },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => FilterFieldDto)
    fields?: Record<string, FilterFieldDto>;
}
