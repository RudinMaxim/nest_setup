import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryParamsDto } from 'src/shared/dto';

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
}
