import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PasswordDto } from 'src/domain/common/dto/password.dto';

export class PasswordUpdateDto extends PasswordDto {
    @ApiProperty({ example: 'password123', description: 'Пароль пользователя' })
    @IsString()
    @MinLength(6, { message: 'Пароль должен быть длиной не менее 6 символов.' })
    @MaxLength(20, { message: 'Пароль не должен превышать 20 символов.' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            'Пароль должен содержать как минимум 1 заглавную букву, 1 строчную букву и 1 цифру или специальный символ.',
    })
    newPassword: string;
}
