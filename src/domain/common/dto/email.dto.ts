import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailDto {
    @ApiProperty({
        example: 'jane@example.com',
        description: 'Адрес электронной почты пользователя',
    })
    @IsEmail({}, { message: 'Пожалуйста, укажите действительный адрес электронной почты.' })
    email: string;
}
