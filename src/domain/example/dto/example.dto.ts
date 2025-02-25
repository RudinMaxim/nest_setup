import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { BaseDto } from 'src/shared/dto';

export class ExampleDto extends BaseDto {
    @ApiProperty({ example: 'Example Title' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'This is an example description' })
    @IsString()
    description: string;

    @ApiProperty({ example: 100 })
    @IsInt()
    value: number;
}
