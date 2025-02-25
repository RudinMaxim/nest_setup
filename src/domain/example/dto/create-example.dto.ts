import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsInt } from 'class-validator';

export class CreateExampleDto {
    @ApiProperty({ example: 'Example Title', maxLength: 255 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @ApiProperty({ example: 'This is an example description' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 100 })
    @IsInt()
    @IsNotEmpty()
    value: number;
}
