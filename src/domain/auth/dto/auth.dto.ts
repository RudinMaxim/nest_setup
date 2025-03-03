import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
    @IsEmail()
    @ApiProperty({
        example: 'jane@example.com',
        description: 'Email пользователя',
    })
    email: string;

    @IsString()
    @ApiProperty({
        example: 'password',
        description: 'Пароль пользователя',
    })
    password: string;
}
