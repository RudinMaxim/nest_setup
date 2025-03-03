import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BaseDto {
    @ApiProperty({ required: false })
    id: number;

    @ApiProperty({ required: false, readOnly: true })
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({ required: false, readOnly: true })
    @IsOptional()
    updatedAt?: Date;
}
