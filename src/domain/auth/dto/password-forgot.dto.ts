import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordForgotDto {
    @IsEmail({}, { message: 'Email is wrong!' })
    @ApiProperty({
        example: 'jane@example.com',
        description: 'Email пользователя',
    })
    email: string;
}
