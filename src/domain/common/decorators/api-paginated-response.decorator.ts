import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
    @ApiProperty({ example: 1, description: 'Unique identifier' })
    id: number;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date' })
    updatedAt: Date;
}
