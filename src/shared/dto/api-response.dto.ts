import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Operation successful' })
    message: string;

    @ApiProperty()
    data?: T;

    @ApiProperty({ example: null })
    error?: any;
}
