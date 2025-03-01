import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class BaseDto {
    @ApiProperty({ required: false })
    @IsUUID()
    uuid: string;

    @ApiProperty({ required: false, readOnly: true })
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({ required: false, readOnly: true })
    @IsOptional()
    updatedAt?: Date;
}
