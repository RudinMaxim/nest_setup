import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export class Example extends BaseEntity {
    @ApiProperty({ example: 'Example Title', description: 'Title of the example' })
    title: string;

    @ApiProperty({ example: 'Example Description', description: 'Detailed description' })
    description: string;

    @ApiProperty({ example: 42, description: 'Numeric value associated' })
    value: number;
}
